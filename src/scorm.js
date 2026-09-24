const findApi = () => {
  let current = window;

  for (let attempt = 0; attempt < 10 && current; attempt += 1) {
    if (current.API) return current.API;
    if (current.parent === current) break;
    current = current.parent;
  }

  return window.opener?.API ?? null;
};

const api = typeof window !== "undefined" ? findApi() : null;

export const learningStore = {
  initialize() {
    try {
      api?.LMSInitialize("");
    } catch {
      // O curso continua funcionando fora de um LMS.
    }
  },

  load() {
    try {
      if (api) {
        const location = api.LMSGetValue("cmi.core.lesson_location");
        const score = Number(api.LMSGetValue("cmi.core.score.raw"));
        return { chapter: Number(location) || 0, stars: score || 0 };
      }

      return JSON.parse(localStorage.getItem("mpi-progress")) ?? {};
    } catch {
      return {};
    }
  },

  save(progress) {
    try {
      localStorage.setItem("mpi-progress", JSON.stringify(progress));

      if (api) {
        api.LMSSetValue("cmi.core.lesson_location", String(progress.chapter));
        api.LMSSetValue("cmi.core.score.raw", String(progress.stars));
        api.LMSSetValue(
          "cmi.core.lesson_status",
          progress.completed?.length >= 3 ? "completed" : "incomplete",
        );
        api.LMSCommit("");
      }
    } catch {
      // Falhas de persistência não interrompem a experiência.
    }
  },

  finish() {
    try {
      api?.LMSFinish("");
    } catch {
      // Sem ação fora do LMS.
    }
  },
};
