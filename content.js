(function () {
  "use strict";

  // Temps de travail cible en minutes (7h24 = 444 minutes)
  let TARGET_WORK_MINUTES = 7 * 60 + 24; // 444 minutes

  // Pause déjeuner minimum en minutes
  const MIN_LUNCH_BREAK_MINUTES = 45;

  function parseTime(timeString) {
    const cleanTime = timeString.trim();
    const [hours, minutes] = cleanTime
      .split(":")
      .map((num) => parseInt(num, 10));
    return { hours, minutes, totalMinutes: hours * 60 + minutes };
  }

  function formatDuration(minutes) {
    const hours = Math.floor(Math.abs(minutes) / 60);
    const mins = Math.abs(minutes) % 60;
    const sign = minutes < 0 ? "-" : "";
    return `${sign}${hours}h ${mins.toString().padStart(2, "0")}m`;
  }

  function formatTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  function getCurrentTime() {
    const now = new Date();
    return {
      hours: now.getHours(),
      minutes: now.getMinutes(),
      totalMinutes: now.getHours() * 60 + now.getMinutes(),
      formatted: formatTime(now.getHours() * 60 + now.getMinutes()),
    };
  }

  function calculateCurrentPeriod(lastClockInTime) {
    const lastClockIn = parseTime(lastClockInTime);
    const currentTime = getCurrentTime();

    let diffMinutes = currentTime.totalMinutes - lastClockIn.totalMinutes;

    if (diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }

    return {
      startTime: lastClockInTime,
      endTime: currentTime.formatted,
      duration: diffMinutes,
      formattedDuration: formatDuration(diffMinutes),
      isCurrent: true,
    };
  }

  function findLunchBreak(validEntries) {
    // Besoin d'au moins 3 entrées pour avoir une pause (entrée-sortie-entrée)
    if (validEntries.length < 3) {
      return { lunchBreakIndex: -1, lunchBreakDuration: 0 };
    }

    const lunchTimeStart = 11 * 60 + 30; // 11:30
    const lunchTimeEnd = 14 * 60 + 15; // 14:15

    let longestBreakIndex = -1;
    let longestBreakDuration = 0;

    // Chercher les pauses entre les périodes de travail
    for (let i = 1; i < validEntries.length - 1; i += 2) {
      if (i + 1 < validEntries.length) {
        const breakStart = parseTime(validEntries[i].time);
        const breakEnd = parseTime(validEntries[i + 1].time);

        // Vérifier si la pause est dans la plage horaire du déjeuner
        const breakStartInRange =
          breakStart.totalMinutes >= lunchTimeStart &&
          breakStart.totalMinutes <= lunchTimeEnd;
        const breakEndInRange =
          breakEnd.totalMinutes >= lunchTimeStart &&
          breakEnd.totalMinutes <= lunchTimeEnd;

        if (breakStartInRange || breakEndInRange) {
          let breakDuration = breakEnd.totalMinutes - breakStart.totalMinutes;
          if (breakDuration < 0) breakDuration += 24 * 60;

          if (breakDuration > longestBreakDuration) {
            longestBreakDuration = breakDuration;
            longestBreakIndex = i;
          }
        }
      }
    }

    return {
      lunchBreakIndex: longestBreakIndex,
      lunchBreakDuration: longestBreakDuration,
    };
  }

  function insertLunchBreakIndicator(
    validEntries,
    lunchBreakIndex,
    lunchBreakDuration
  ) {
    if (lunchBreakIndex === -1) {
      return;
    }

    // Supprimer les indicateurs existants
    const existingIndicators = document.querySelectorAll(
      ".lunch-break-indicator"
    );
    existingIndicators.forEach((indicator) => indicator.remove());

    // Trouver l'élément DOM correspondant à la fin de la première période (avant la pause déjeuner)
    const endOfFirstPeriodEntry = validEntries[lunchBreakIndex];
    if (!endOfFirstPeriodEntry || !endOfFirstPeriodEntry.element) {
      return;
    }

    // Créer l'indicateur de pause repas
    const lunchIndicator = document.createElement("div");
    lunchIndicator.className = "lunch-break-indicator";
    lunchIndicator.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 12px 15px;
            margin: 3px 0;
            background: linear-gradient(45deg, #fff3cd, #ffeaa7);
            border: 2px dashed #ffc107;
            border-radius: 6px;
            font-weight: bold;
            color: #856404;
            font-size: 14px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            animation: fadeIn 0.5s ease-in;
            z-index: 1000;
        `;

    // Ajouter l'animation CSS
    if (!document.querySelector("#lunch-break-style")) {
      const style = document.createElement("style");
      style.id = "lunch-break-style";
      style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
      document.head.appendChild(style);
    }

    const lunchDurationIsAdjusted =
      lunchBreakDuration < MIN_LUNCH_BREAK_MINUTES;
    lunchIndicator.innerHTML = `
            <span style="margin-right: 8px;">🍽️</span>
            <span>Pause repas - ${lunchBreakDuration} minutes</span>
            <span style="margin-left: 8px;">🍽️</span>
            <span style="margin-left: 8px;">
             ${
               lunchDurationIsAdjusted
                 ? ` (ajustée à ${MIN_LUNCH_BREAK_MINUTES} minutes)`
                 : ``
             }
            </span>
        `;

    // Insérer l'indicateur après l'élément de fin de première période
    try {
      endOfFirstPeriodEntry.element.parentNode.insertBefore(
        lunchIndicator,
        endOfFirstPeriodEntry.element
      );
    } catch (error) {
      // En cas d'erreur, ne pas faire planter le script
    }
  }

  function calculateTargetClockOut(
    timeEntries,
    totalWorkedMinutes,
    hasDetectedLunchBreak,
    lunchBreakDuration
  ) {
    if (timeEntries.length === 0) {
      return null;
    }

    // Si aucune pause repas détectée, ajouter 45 minutes
    if (!hasDetectedLunchBreak) {
      remainingMinutes += MIN_LUNCH_BREAK_MINUTES;
    }

    // Vérifier si nous avons un nombre impair d'entrées (actuellement pointé)
    if (timeEntries.length % 2 !== 0) {
      let remainingMinutes = TARGET_WORK_MINUTES - totalWorkedMinutes;

      if (lunchBreakDuration < MIN_LUNCH_BREAK_MINUTES) {
        remainingMinutes += MIN_LUNCH_BREAK_MINUTES - lunchBreakDuration;
      }

      if (remainingMinutes <= 0) {
        return {
          status: "exceeded",
          message: "Objectif de temps de travail déjà atteint !",
        };
      }

      // Utiliser l'heure actuelle au lieu de l'heure du dernier pointage
      const currentTime = getCurrentTime();
      const targetClockOutMinutes = currentTime.totalMinutes + remainingMinutes;

      // Gérer le passage à minuit
      const adjustedMinutes =
        targetClockOutMinutes >= 24 * 60
          ? targetClockOutMinutes - 24 * 60
          : targetClockOutMinutes;

      return {
        status: "clocked_in",
        time: formatTime(adjustedMinutes),
        remainingMinutes,
        message: `Pointer à ${formatTime(
          adjustedMinutes
        )} pour atteindre ${formatDuration(TARGET_WORK_MINUTES)}`,
      };
    } else {
      let remainingMinutes = TARGET_WORK_MINUTES - totalWorkedMinutes;

      if (remainingMinutes <= 0) {
        return {
          status: "completed",
          message: "Temps de travail cible terminé !",
        };
      }

      return {
        status: "clocked_out",
        remainingMinutes,
        message: `Il reste encore ${formatDuration(
          remainingMinutes
        )} de temps de travail`,
      };
    }
  }

  function calculateTimeDifferences() {
    const viewLogContainer = document.querySelector(".view-log");

    if (!viewLogContainer) {
      return false;
    }

    // Utiliser la classe CSS correcte view-log__row
    const logEntries = viewLogContainer.querySelectorAll(".view-log__row");

    if (logEntries.length === 0) {
      return false;
    }

    // Supprimer le résumé existant
    const existingSummary = document.querySelector(".time-summary");
    if (existingSummary) {
      existingSummary.remove();
    }

    // Extraire les données de temps
    const timeEntries = Array.from(logEntries).map((entry) => {
      const dateSpan = entry.querySelector('[data-e2e="punch-log-date"]');
      const timeSpan = entry.querySelector('[data-e2e="punch-log-time"]');
      const actionSpan = entry.querySelector('[data-e2e="punch-log-action"]');

      return {
        date: dateSpan ? dateSpan.textContent.trim() : "",
        time: timeSpan ? timeSpan.textContent.trim() : "",
        action: actionSpan ? actionSpan.textContent.trim() : "",
        element: entry,
      };
    });

    // Filtrer les entrées valides et trier par heure
    const validEntries = timeEntries.filter((entry) => entry.time);

    validEntries.sort((a, b) => {
      const timeA = parseTime(a.time);
      const timeB = parseTime(b.time);
      return timeA.totalMinutes - timeB.totalMinutes;
    });

    // Trouver et marquer la pause déjeuner
    const { lunchBreakIndex, lunchBreakDuration } =
      findLunchBreak(validEntries);
    const lunchBreakIndexIsNumber =
      typeof lunchBreakIndex === "number" && isFinite(lunchBreakIndex);
    const hasDetectedLunchBreak =
      lunchBreakIndexIsNumber && lunchBreakIndex !== -1;
    insertLunchBreakIndicator(
      validEntries,
      lunchBreakIndex,
      lunchBreakDuration
    );

    // Calculer les différences de temps entre les paires
    const timeDifferences = [];
    let totalWorkedMinutes = 0;

    for (let i = 0; i < validEntries.length - 1; i += 2) {
      if (i + 1 < validEntries.length) {
        const startTime = parseTime(validEntries[i].time);
        const endTime = parseTime(validEntries[i + 1].time);

        let diffMinutes = endTime.totalMinutes - startTime.totalMinutes;
        if (diffMinutes < 0) diffMinutes += 24 * 60;

        totalWorkedMinutes += diffMinutes;

        timeDifferences.push({
          startTime: validEntries[i].time,
          endTime: validEntries[i + 1].time,
          duration: diffMinutes,
          formattedDuration: formatDuration(diffMinutes),
        });
      }
    }

    // Si nombre impair d'entrées, calculer la période en cours
    let currentPeriod = null;
    if (validEntries.length % 2 !== 0) {
      currentPeriod = calculateCurrentPeriod(
        validEntries[validEntries.length - 1].time
      );
      totalWorkedMinutes += currentPeriod.duration;
    }

    // Calculer les heures supplémentaires
    const overtimeMinutes = totalWorkedMinutes - TARGET_WORK_MINUTES;

    // Calculer l'heure de pointage cible
    const targetInfo = calculateTargetClockOut(
      validEntries,
      totalWorkedMinutes,
      hasDetectedLunchBreak,
      lunchBreakDuration
    );

    // Créer et insérer le résumé
    createSummary(
      timeDifferences,
      currentPeriod,
      totalWorkedMinutes,
      overtimeMinutes,
      targetInfo,
      viewLogContainer
    );

    return true;
  }

  function createSummary(
    timeDifferences,
    currentPeriod,
    totalWorkedMinutes,
    overtimeMinutes,
    targetInfo,
    container
  ) {
    const summaryDiv = document.createElement("div");
    summaryDiv.className = "time-summary";
    summaryDiv.style.cssText = `
            margin-top: 15px;
            padding: 15px;
            background-color: #f5f5f5;
            border: 2px solid #007cba;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        `;

    let summaryHTML =
      '<h3 style="margin: 0 0 15px 0; color: #333;">⏰ Résumé des Temps</h3>';

    // Afficher la période en cours si applicable
    if (currentPeriod) {
      summaryHTML += `
                <div style="margin: 5px 0; padding: 8px; background: #e8f5e8; border-radius: 4px; border-left: 3px solid #28a745;">
                    <strong>Période en cours:</strong> ${currentPeriod.startTime} - ${currentPeriod.endTime} = 
                    <span style="color: #28a745; font-weight: bold;">${currentPeriod.formattedDuration}</span>
                    <span style="margin-left: 8px; font-size: 12px; color: #666;">(temps réel)</span>
                </div>
            `;
    }

    // Afficher les périodes individuelles
    timeDifferences.forEach((diff, index) => {
      summaryHTML += `
                <div style="margin: 5px 0; padding: 8px; background: white; border-radius: 4px; border-left: 3px solid #007cba;">
                    <strong>Période ${index + 1}:</strong> ${
        diff.startTime
      } - ${diff.endTime} = 
                    <span style="color: #007cba; font-weight: bold;">${
                      diff.formattedDuration
                    }</span>
                </div>
            `;
    });

    // Total actuel
    const isTargetReached = totalWorkedMinutes >= TARGET_WORK_MINUTES;

    summaryHTML += `
            <div style="margin-top: 15px; padding: 12px; background: ${
              isTargetReached ? "#28a745" : "#007cba"
            }; color: white; border-radius: 4px; text-align: center; font-size: 16px;">
                <strong>🕐 Temps de travail actuel: ${formatDuration(
                  totalWorkedMinutes
                )} (${
      overtimeMinutes > 0 ? "+" : ""
    }${overtimeMinutes} minutes)</strong>
            </div>
        `;

    // Informations sur l'objectif
    if (targetInfo) {
      let targetStyle = "";
      let targetIcon = "";

      switch (targetInfo.status) {
        case "clocked_in":
          targetStyle =
            "background: #ffc107; color: #212529; border: 2px solid #fd7e14;";
          targetIcon = "🎯";
          break;
        case "exceeded":
          targetStyle =
            "background: #28a745; color: white; border: 2px solid #20c997;";
          targetIcon = "✅";
          break;
        case "completed":
          targetStyle =
            "background: #28a745; color: white; border: 2px solid #20c997;";
          targetIcon = "🎉";
          break;
        case "clocked_out":
          targetStyle =
            "background: #17a2b8; color: white; border: 2px solid #138496;";
          targetIcon = "⏳";
          break;
      }

      summaryHTML += `
                <div style="margin-top: 10px; padding: 12px; ${targetStyle} border-radius: 4px; text-align: center; font-size: 16px; font-weight: bold;">
                    ${targetIcon} ${targetInfo.message}
                </div>
            `;
    }

    summaryDiv.innerHTML = summaryHTML;
    container.parentNode.insertBefore(summaryDiv, container.nextSibling);
  }

  // Écouter les messages du popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "recalculate") {
      const success = calculateTimeDifferences();
      sendResponse({ success });
    } else if (request.action === "updateTarget") {
      TARGET_WORK_MINUTES = request.hours * 60 + request.minutes;
      calculateTimeDifferences();
      sendResponse({ success: true });
    }
  });

  // Observateur DOM amélioré
  function setupObserver() {
    let observerTimeout;
    const observer = new MutationObserver((mutations) => {
      clearTimeout(observerTimeout);
      observerTimeout = setTimeout(() => {
        const viewLog = document.querySelector(".view-log");
        if (viewLog && !document.querySelector(".time-summary")) {
          calculateTimeDifferences();
        }
      }, 1000);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return observer;
  }

  // Initialiser avec plusieurs stratégies
  function initialize() {
    // Charger les paramètres sauvegardés
    chrome.storage.sync.get(
      ["targetHours", "targetMinutes"],
      function (result) {
        if (result.targetHours && result.targetMinutes) {
          TARGET_WORK_MINUTES = result.targetHours * 60 + result.targetMinutes;
        }
      }
    );

    // Stratégie 1: Exécution immédiate
    setTimeout(() => {
      calculateTimeDifferences();
    }, 2000);

    // Stratégie 2: Attendre le chargement d'Angular
    setTimeout(() => {
      calculateTimeDifferences();
    }, 5000);

    // Stratégie 3: Configurer l'observateur
    setupObserver();

    // Stratégie 4: Déclencheurs manuels
    window.calculateWorkTime = function () {
      return calculateTimeDifferences();
    };

    // Fonction pour changer le temps cible
    window.setTargetTime = function (hours, minutes) {
      const newTarget = hours * 60 + minutes;
      TARGET_WORK_MINUTES = newTarget;
      calculateTimeDifferences();
    };
  }

  // Démarrer l'initialisation
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
