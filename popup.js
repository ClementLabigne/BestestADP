document.addEventListener('DOMContentLoaded', function() {
    const calculateBtn = document.getElementById('calculate-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const saveSettingsBtn = document.getElementById('save-settings');
    const targetHoursInput = document.getElementById('target-hours');
    const targetMinutesInput = document.getElementById('target-minutes');
    const targetTimeDisplay = document.getElementById('target-time');
    const status = document.getElementById('status');

    // Charger les paramètres sauvegardés
    chrome.storage.sync.get(['targetHours', 'targetMinutes'], function(result) {
        const hours = result.targetHours || 7;
        const minutes = result.targetMinutes || 24;
        
        targetHoursInput.value = hours;
        targetMinutesInput.value = minutes;
        updateTargetTimeDisplay(hours, minutes);
    });

    // Bouton de recalcul
    calculateBtn.addEventListener('click', function() {
        status.textContent = '🔄 Recalcul en cours...';
        status.className = 'status working';
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0].url.includes('mon.adp.com/redbox')) {
                chrome.tabs.sendMessage(tabs[0].id, {action: 'recalculate'}, function(response) {
                    if (chrome.runtime.lastError) {
                        status.textContent = '❌ Page ADP non détectée - rechargez la page';
                        status.className = 'status inactive';
                    } else if (response && response.success) {
                        status.textContent = '✅ Temps recalculés avec succès';
                        status.className = 'status active';
                        setTimeout(resetStatus, 3000);
                    } else {
                        status.textContent = '⚠️ Aucune donnée de pointage trouvée';
                        status.className = 'status working';
                        setTimeout(resetStatus, 3000);
                    }
                });
            } else {
                status.textContent = '⚠️ Veuillez naviguer vers une page ADP RedBox';
                status.className = 'status inactive';
                setTimeout(resetStatus, 3000);
            }
        });
    });

    // Bouton des paramètres
    settingsBtn.addEventListener('click', function() {
        if (settingsPanel.style.display === 'none' || settingsPanel.style.display === '') {
            settingsPanel.style.display = 'block';
            settingsBtn.textContent = '❌ Fermer';
            settingsBtn.className = 'btn btn-secondary';
        } else {
            settingsPanel.style.display = 'none';
            settingsBtn.textContent = '⚙️ Paramètres';
            settingsBtn.className = 'btn btn-secondary';
        }
    });

    // Sauvegarde des paramètres
    saveSettingsBtn.addEventListener('click', function() {
        const hours = parseInt(targetHoursInput.value);
        const minutes = parseInt(targetMinutesInput.value);
        
        if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
            status.textContent = '❌ Valeurs invalides (1-12h, 0-59m)';
            status.className = 'status inactive';
            setTimeout(resetStatus, 3000);
            return;
        }

        chrome.storage.sync.set({
            targetHours: hours,
            targetMinutes: minutes
        }, function() {
            updateTargetTimeDisplay(hours, minutes);
            
            // Notifier le content script du changement
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0].url.includes('mon.adp.com/redbox')) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'updateTarget',
                        hours: hours,
                        minutes: minutes
                    });
                }
            });
            
            status.textContent = '💾 Paramètres sauvegardés avec succès';
            status.className = 'status active';
            
            setTimeout(() => {
                settingsPanel.style.display = 'none';
                settingsBtn.textContent = '⚙️ Paramètres';
                resetStatus();
            }, 2000);
        });
    });

    function updateTargetTimeDisplay(hours, minutes) {
        targetTimeDisplay.textContent = `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }

    function resetStatus() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0].url.includes('mon.adp.com/redbox')) {
                status.textContent = '✅ Extension active sur cette page';
                status.className = 'status active';
            } else {
                status.textContent = '⚠️ Naviguez vers une page ADP pour utiliser l\'extension';
                status.className = 'status inactive';
            }
        });
    }

    // Vérification initiale de la page
    resetStatus();
});