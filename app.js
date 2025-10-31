// SCN Growth – calculadora simple (robusta para móvil)
(function () {
  const $ = (id) => document.getElementById(id);

  // Si el script cargó, ocultamos el aviso
  const jsWarn = $("jsWarning");
  if (jsWarn) jsWarn.classList.add("hidden");

  function toNumber(txt) {
    if (txt === null || txt === undefined) return NaN;
    // reemplaza coma por punto y quita espacios
    return Number(String(txt).replace(',', '.').trim());
  }

  const annualRate = 0.062; // 6.2% anual
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
  const RMSE = 10.74;

  const form = $("form");
  const sizePrev = $("sizePrev");
  const months = $("months");
  const observed = $("observed");
  const results = $("results");
  const list = $("list");
  const alertsCard = $("alerts");
  const alertList = $("alertList");
  const clearBtn = $("clearBtn");

  function calc(e) {
    e.preventDefault();
    try {
      const sPrev = toNumber(sizePrev.value);
      const m = Number(months.value);
      const sObsTxt = observed.value.trim();
      const sObs = sObsTxt ? toNumber(sObsTxt) : NaN;

      if (!isFinite(sPrev) || sPrev <= 0) {
        alert("Ingresá un tamaño previo válido en mm.");
        return;
      }
      if (!Number.isInteger(m) || m < 1) {
        alert("Ingresá un intervalo en meses (entero ≥ 1).");
        return;
      }
      if (sObsTxt && (!isFinite(sObs) || sObs <= 0)) {
        alert("El tamaño observado debe ser un número válido en mm.");
        return;
      }

      // cálculo esperado
      const expected = sPrev * Math.pow(1 + annualRate, m / 12);
      const delta = expected - sPrev;

      // limpia resultados previos
      list.innerHTML = "";
      alertList.innerHTML = "";

      // resultados básicos
      const li1 = document.createElement("li");
      li1.textContent = `Crecimiento mensual compuesto (esperado): ${(monthlyRate * 100).toFixed(2)} % por mes`;
      const li2 = document.createElement("li");
      li2.textContent = `Tamaño esperado en el control: ${expected.toFixed(1)} mm (variación +${delta.toFixed(1)} mm)`;
      list.appendChild(li1);
      list.appendChild(li2);

      // alertas / reglas
      const alerts = [];
      const rules = [];

      if (isFinite(sObs)) {
        const diff = sObs - expected;
        const lower = Math.max(0, expected - RMSE);
        const upper = expected + RMSE;

        const li3 = document.createElement("li");
        li3.innerHTML = `<strong>Diferencia observado - esperado</strong>: ${diff.toFixed(1)} mm`;
        const li4 = document.createElement("li");
        li4.innerHTML = `<strong>Banda de tolerancia (+/-RMSE)</strong>: ${lower.toFixed(1)} - ${upper.toFixed(1)} mm`;
        list.appendChild(li3);
        list.appendChild(li4);

        if (sObs > upper) {
          alerts.push({ cls: "risk", text: "Crecimiento mayor al esperado (por encima de +RMSE). Reevaluar y discutir en equipo multidisciplinario." });
        } else if (sObs < lower) {
          alerts.push({ cls: "warn", text: "Tamaño menor al esperado (por debajo de -RMSE). Verificar consistencia de mediciones y modalidad (CT/MRI)." });
        } else {
          alerts.push({ cls: "ok", text: "Crecimiento dentro del rango esperado para el intervalo." });
        }

        if (sObs >= 40) {
          rules.push({ cls: "warn", text: "Tamaño ≥ 40 mm (4 cm): considerar discusión de riesgos locales y opción quirúrgica si hay crecimiento acelerado o síntomas." });
        }
      } else {
        if (expected >= 40) {
          rules.push({ cls: "warn", text: "Tamaño esperado ≥ 40 mm: considerar discusión según clínica." });
        }
      }

      if (alerts.length || rules.length) {
        alertsCard.classList.remove("hidden");
        [...alerts, ...rules].forEach((item) => {
          const li = document.createElement("li");
          li.className = item.cls;
          li.textContent = item.text;
          alertList.appendChild(li);
        });
      } else {
        alertsCard.classList.add("hidden");
      }

      results.classList.remove("hidden");
    } catch (err) {
      console.error("Error en cálculo:", err);
      alert("Ocurrió un error en el cálculo. Actualiza la página e intenta de nuevo.");
    }
  }

  function clearAll() {
    form.reset();
    results.classList.add("hidden");
    alertsCard.classList.add("hidden");
    list.innerHTML = "";
    alertList.innerHTML = "";
  }

  form.addEventListener("submit", calc, { passive: false });
  clearBtn.addEventListener("click", clearAll);
})();
