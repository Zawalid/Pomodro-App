"use strict";
const c = console.log;
//* Selectors
//Options
const pomodoro = document.querySelector(".pomodoro");
const shortBreak = document.querySelector(".shortBreak");
const longBreak = document.querySelector(".longBreak");
//Timer
const displayTimeField = document.querySelector(".timer h1");
const startBtn = document.querySelector(".start");
//Activate the timer Options
const options = [...document.querySelector(".options").children];
//Change the option confirmation
const changeOptionModal = document.querySelector(".changeOption");
const closeModal = document.querySelector(".changeOption > div .close");
const okBtn = document.querySelector(".changeOption > div .ok");
const cancelBtn = document.querySelector(".changeOption > div .cancel");
//settings
const settings = document.querySelector(".settings");
const settingsModal = document.querySelector(".settings-container");
//----Buttons
const settingOpen = document.querySelector(".settings_open");
const settingsClose = document.querySelector(".settings-container .close");
const settingsSave = document.querySelector(".settings-container .apply");
const settingsReset = document.querySelector(".settings-container .reset");
//----Time values
const pomodoroTimeValue = document.querySelector(".settings .pomodoro_time");
const shortBreakTimeValue = document.querySelector(
  ".settings .shortBreak_time"
);
const longBreakTimeValue = document.querySelector(".settings .longBreak_time");
const longBreakTimeInterval = document.querySelector(".longBreak_interval");
//----Switchers
const autoStartPomodoros = document.querySelector(".autoStartPomodoros");
const autoStartBreaks = document.querySelector(".autoStartBreaks");
const darkMode = document.querySelector(".darkMode");
//----Themes
const themeColorsContainer = document.querySelector(".themeColors");
const themesChooser = document.querySelector(".theme_settings .themes");
const themeColors = document.querySelector(".themeColors .themes");
const pomodoroTheme = document.querySelector(".pomodoro_theme");
const shortBreakTheme = document.querySelector(".shortBreak_theme");
const longBreakTheme = document.querySelector(".longBreak_theme");
const currentOptionIndicator = document.querySelector(
  ".themeColors .current_option"
);
//----Sounds
const clickSound = document.getElementById("clickSound");
const fastTickingSound = document.getElementById("fastTickingSound");
const slowTickingSound = document.getElementById("slowTickingSound");
const alarmSoundsDropDown = document.querySelector(
  ".alarm_sounds .dropdown__header"
);
const alarmSounds = document.querySelector(".alarm_sounds .dropdown__body");
const alarmRepetition = document.querySelector(".alarm_repetition");
const tickingSoundsDropDown = document.querySelector(
  ".ticking_sounds .dropdown__header"
);
const tickingSounds = document.querySelector(".ticking_sounds .dropdown__body");
const defaultAlarm = document.getElementById("beepAlarmSound");
const defaultTicking = document.getElementById("fastTickingSound");
// Progress
const progressCircle = document.querySelector(".progress-circle__fill");
//==========================================================================
//* Variables
//To keep trace of the time
//To keep trace of the time when the timer is paused
let time, //Current timer value
  timeAtPause, //Timer value at pause
  startInterval, //To pause the timer
  autoStartBreaksCheck, //Check for the autoStartBreaks switch
  autoStartPomodorosCheck, //Check for the autoStartPomodoros switch
  darkModeCheck, //Check for the darkMode switch
  currentOption, //To keep track of the current option (pomodoro/short/long)
  selectedSound,
  selectedAlarmSound, //To keep track of the selected alarm sound
  selectedTickingSound, //To keep track of the selected ticking sound
  pauseAudio, //Keep track of the setTimeOut (stop it if the user chooses another sound instead of waiting for the expiration time )
  selectedAlarmSoundName,
  selectedTickingSoundName;
//To keep trace when to switch to long break
let longBreakTimeIntervalValue = +longBreakTimeInterval.value;
let pomodoroCount = 0;
//To specify which message i should write(focus/break)
let currentStatus = "focus";
//To display the time on the tab title
let displayTimeOnTitle = document.head.querySelector("title");
//Timer themes
const timerThemes = {
  pomodoro: {
    theme: "pomodoro_theme",
    color: "#ba4949",
  },
  shortBreak: {
    theme: "shortBreak_theme",
    color: "#7d53a2",
  },
  longBreak: {
    theme: "longBreak_theme",
    color: "#38858a",
  },
};
//==========================================================================
//* Initialize
//Check if the settings are saved and retrieve the them
localStorage.getItem("settings") ? getSettings() : getDefaultSettings();
//Check if the current option is saved and retrieve it and set the correspondent message
if (
  localStorage.getItem("currentOption") == "pomodoro" ||
  !localStorage.getItem("currentOption")
) {
  document.querySelector(".pomodoro").classList.add("active");
} else if (localStorage.getItem("currentOption") == "shortBreak") {
  currentStatus = "shortBreak";
  document.querySelector(".shortBreak").classList.add("active");
} else {
  currentStatus = "longBreak";
  document.querySelector(".longBreak").classList.add("active");
}
//Retrieve the saved themes
if (localStorage.getItem("timerThemes")) {
  const savedTimerThemes = JSON.parse(localStorage.getItem("timerThemes"));
  for (const theme in savedTimerThemes) {
    timerThemes[theme] = savedTimerThemes[theme];
  }
}
//Set the dropdowns
dropDownFunc(alarmSoundsDropDown, alarmSounds);
dropDownFunc(tickingSoundsDropDown, tickingSounds);
//Display time and message on the title
displayTimeAndMsg();
//==========================================================================
//* Functions
//Start timer function
function startTimer(duration) {
  let timer, minutes, seconds;
  timer = duration * 60;
  const initialTime = timer;
  const wholeCircle = 1130;
  const timerFunction = () => {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    //Display time on the timer
    displayTimeField.textContent = `${minutes}:${seconds}`;
    //Display time on the title
    displayTimeOnTitle.textContent = `${minutes}:${seconds} - ${getStatus()}`;
    //Keep trace of the current time value for the stop state
    timeAtPause = timer;
    //Decrement the time
    const percentage = (timer / initialTime) * 100;
    const stroke = wholeCircle - (wholeCircle * percentage) / 100 + 127;
    progressCircle.style.strokeDashoffset = stroke;
    if (--timer < 0) {
      clearInterval(startInterval);
      setClassAndTexContent("start", startBtn);
      if (currentStatus == "focus") {
        //Keep trace which break it is
        let whichBreak;
        //Keep trace of the number of pomodoros
        pomodoroCount++;
        //Check for the number of pomodoros in order to switch to long break
        pomodoroCount == longBreakTimeIntervalValue
          ? ((whichBreak = ".longBreak"), (pomodoroCount = 0))
          : ((whichBreak = ".shortBreak"), (pomodoroCount = pomodoroCount));
        //Switch to the correspondent break
        document.querySelector(whichBreak).dispatchEvent(new Event("click"));
        //Start alarm
        let repeatCount = +alarmRepetition.value;
        selectedAlarmSound.addEventListener("ended", function () {
          if (repeatCount > 0) {
            repeatCount--;
            this.currentTime = 0; // Reset the audio to the beginning
            this.play(); // Play the audio again
          } else {
            //TO get -1 in order to start the break after the alarm ends
            repeatCount--;
          }
        });
        //Play the sound
        selectedAlarmSound.play();
        //Check whether the timer start is automatic
        if (autoStartBreaksCheck) {
          selectedAlarmSound.addEventListener("ended", () => {
            if (repeatCount === -1) startBtn.dispatchEvent(new Event("click"));
          });
        }
        //Stop the ticking sound
        selectedTickingSound.pause();
      } else {
        //Switch to the pomodoro timer
        document.querySelector(".pomodoro").dispatchEvent(new Event("click"));
        if (autoStartPomodorosCheck) startBtn.dispatchEvent(new Event("click"));
      }
    }
  };
  //Start the timer
  timerFunction();
  startInterval = setInterval(timerFunction, 1000);
}
//Display time and message on the title
function displayTimeAndMsg() {
  //Save the current option in localStorage
  currentOption = options.find((e) => e.classList.contains("active"));
  localStorage.setItem("currentOption", currentOption.classList[0]);
  //Set the time depending on the chosen option
  time = currentOption.dataset.time;
  //If time is on minutes
  const minutesAndSeconds = `${time < 10 ? "0" : ""}${time}:00`;
  //If time is on seconds
  const secondsOnly = `00:${time * 60 < 10 ? "0" : ""}${time * 60}`;

  displayTimeField.textContent = time >= 1 ? minutesAndSeconds : secondsOnly;
  displayTimeOnTitle.textContent = `${
    time >= 1 ? minutesAndSeconds : secondsOnly
  } - ${getStatus()}`;
  //Set the correspondent theme
  document.documentElement.style.setProperty(
    "--theme",
    timerThemes[currentOption.classList[0]].color
  );
}
//Get the status of the timer
function getStatus() {
  let message;
  currentStatus == "focus"
    ? (message = "Time to focus!")
    : currentStatus == "shortBreak"
    ? (message = "Time for a short break!")
    : (message = "Time for a long break!");
  return message;
}
//Set the class and text content of the button function
const setClassAndTexContent = (action, button) => {
  button.textContent = action.toUpperCase();
  button.className = action;
};
//Options choosing
function chooseOption(el) {
  //Remove active class from all options
  options.forEach((e) => (e.className = e.classList[0]));
  //Add active class to the current option
  el.classList.add("active");
  //Set the current option
  currentStatus =
    el.classList[0] == "pomodoro"
      ? "focus"
      : (currentStatus =
          el.classList[0] == "shortBreak" ? "shortBreak" : "longBreak");
  //Stop the Timer
  clearInterval(startInterval);
  setClassAndTexContent("start", startBtn);
  //Set the time and display it
  displayTimeAndMsg();
}
//Get the saved settings
function getSettings() {
  //Get the settings object
  const settings = JSON.parse(localStorage.getItem("settings"));
  //Get the time values
  pomodoroTimeValue.value = pomodoro.dataset.time = settings.pomodoro;
  shortBreakTimeValue.value = shortBreak.dataset.time = settings.shortBreak;
  longBreakTimeValue.value = longBreak.dataset.time = settings.longBreak;
  //Get the switchers
  autoStartPomodoros.checked = autoStartPomodorosCheck =
    settings.autoStartPomodoros;
  autoStartBreaks.checked = autoStartBreaksCheck = settings.autoStartBreaks;
  darkMode.checked = darkModeCheck = settings.darkMode;
  //Get the long break interval
  longBreakTimeInterval.value = longBreakTimeIntervalValue =
    settings.longBreakTimeInterval;
  //Get the active option
  document
    .querySelector(`.${localStorage.getItem("currentOption")}`)
    .classList.add("active");
  //Get the sound settings
  alarmRepetition.value = settings.alarmRepetitionCount;
  selectedAlarmSound = document.querySelector(`#${settings.alarmSound}`);
  selectedTickingSound = settings.tickingSound
    ? document.querySelector(`#${settings.tickingSound}`)
    : null;
  //Sound Names
  alarmSoundsDropDown.firstElementChild.firstElementChild.textContent =
    selectedAlarmSoundName = settings.alarmSoundName;
  tickingSoundsDropDown.firstElementChild.firstElementChild.textContent =
    selectedTickingSoundName = settings.tickingSoundName;
}
//Get the default settings
function getDefaultSettings() {
  //Get the time values
  pomodoroTimeValue.value = pomodoro.dataset.time = 25;
  shortBreakTimeValue.value = shortBreak.dataset.time = 5;
  longBreakTimeValue.value = longBreak.dataset.time = 15;
  //Get the switchers
  autoStartPomodoros.checked = autoStartPomodorosCheck = false;
  autoStartBreaks.checked = autoStartBreaksCheck = false;
  darkMode.checked = darkModeCheck = false;
  //Get the long break interval
  longBreakTimeInterval.value = longBreakTimeIntervalValue = 4;
  //Sound setting
  alarmRepetition.value = 0;
  selectedAlarmSound = defaultAlarm;
  selectedTickingSound = defaultTicking;
  //Sound Names
  alarmSoundsDropDown.firstElementChild.firstElementChild.textContent = "Beep";
  tickingSoundsDropDown.firstElementChild.firstElementChild.textContent =
    "Fast Ticking";
}
//Close the settings modal
function closeSettings() {
  settings.style.height = "23%";
  settings.querySelector(".scroll").style.height = "0";
  settings.firstElementChild.style.boxShadow = "none";
  settings.lastElementChild.style.boxShadow = "none";

  setTimeout(() => {
    settingsModal.classList.remove("show");
  }, 500);
}
//Dropdown
function dropDownFunc(dropDown, dropDownContent) {
  dropDown.addEventListener("click", (e) => {
    if (e.target.closest("svg")) {
      dropDownContent.classList.toggle("drop");
      dropDownContent.addEventListener("click", (e) => {
        if (e.target.closest("li")) {
          //Set the selected sound name in the dropdown
          dropDown.firstElementChild.firstElementChild.textContent =
            e.target.textContent;

          //Stop all Sounds
          [...document.getElementsByTagName("audio")].forEach((audio) => {
            !audio.paused ? audio.pause() : "";
          });
          //Alarm sound
          if (dropDownContent == alarmSounds) {
            selectedAlarmSound = document.getElementById(
              e.target.dataset.audio
            );
          }
          //Ticking sound
          if (dropDownContent == tickingSounds) {
            selectedTickingSound = document.getElementById(
              e.target.dataset.audio
            );
          }
          if (dropDown == alarmSoundsDropDown)
            selectedAlarmSoundName = e.target.textContent;

          if (dropDown == tickingSoundsDropDown)
            selectedTickingSoundName = e.target.textContent;
          //Selected sound
          selectedSound = document.getElementById(e.target.dataset.audio);
          //Play the selected sound
          if (selectedSound) {
            try {
              const playPromise = selectedSound.play();
              if (playPromise !== undefined) {
                playPromise.then((_) => {});
              }
            } catch (error) {
              console.error("Error starting media playback:", error);
            }
          }
          dropDownContent.classList.remove("drop");
        }
      });
    }
  });
}
//==========================================================================
//* Events
//Start timer
startBtn.addEventListener("click", function () {
  //Click sound
  clickSound.play();

  if (this.className == "start") {
    //Add the click animation
    document.querySelector(".timer").classList.add("started");
    //Check if the ticking sound is enabled and play it
    if (currentStatus == "focus") {
      setTimeout(() => {
        selectedTickingSound
          ? selectedTickingSound.setAttribute("loop", "1")
          : "";
        selectedTickingSound ? selectedTickingSound.play() : "";
      }, clickSound.duration * 1000);
    }
    setClassAndTexContent("pause", this);
    startTimer(time);
    //Check if the dark mode is enabled and change the theme when the timer is running
    if (darkModeCheck) {
      document.querySelector(".timer").style.backgroundColor = "transparent";
      document.documentElement.style.setProperty("--theme", "#000");
      options[0].parentElement.style.backgroundColor = "transparent";
      options
        .find((e) => e.classList.contains("active"))
        .classList.add("active_dark");
    }
  } else {
    //Remove the click animation
    document.querySelector(".timer").classList.remove("started");
    setClassAndTexContent("start", this);
    clearInterval(startInterval);
    time = timeAtPause / 60;
    //Reset the theme
    document.documentElement.style.setProperty(
      "--theme",
      timerThemes[currentOption.classList[0]].color
    );
    //Remove te darkMode styles
    if (darkModeCheck) {
    }
    document.querySelector(".timer").style.backgroundColor =
      "rgba(255, 255, 255, 0.1)";
    options[0].parentElement.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
    options
      .find((e) => e.classList.contains("active"))
      .classList.remove("active_dark");
    //Stop the ticking sound
    selectedTickingSound ? selectedTickingSound.pause() : "";
  }
});

//Options
options.forEach((e) => {
  e.addEventListener("click", () => {
    document.querySelector(".timer").classList.remove("started");
    if (startBtn.className == "start") {
      chooseOption(e);
    } else {
      changeOptionModal.classList.add("show");
      changeOptionModal.addEventListener("click", (event) => {
        if (event.target == okBtn) {
          changeOptionModal.classList.remove("show");
          chooseOption(e);
          selectedTickingSound.pause();
        } else if (event.target == cancelBtn) {
          changeOptionModal.classList.remove("show");
        }
      });
    }
  });
});

//Settings
settingOpen.addEventListener("click", () => {
  settingsModal.classList.add("show");
  setTimeout(() => {
    settings.style.height = "100%";
    settings.querySelector(".scroll").style.height = "80%";
    settings.firstElementChild.style.boxShadow = "-5px 6px 20px #ccc";
    settings.lastElementChild.style.boxShadow = "5px -6px 20px #ccc";
  }, 500);
});

settingsClose.addEventListener("click", () => {
  closeSettings();
});
settingsSave.addEventListener("click", () => {
  time = time;
  closeSettings();
  //Set values
  pomodoro.dataset.time = pomodoroTimeValue.value;
  shortBreak.dataset.time = shortBreakTimeValue.value;
  longBreak.dataset.time = longBreakTimeValue.value;
  longBreakTimeIntervalValue = Math.floor(longBreakTimeInterval.value);
  //Display time and message on the title
  displayTimeAndMsg();
  //Check whether the timer start is automatic and the the darkMode
  autoStartBreaks.checked
    ? (autoStartBreaksCheck = true)
    : (autoStartBreaksCheck = false);
  autoStartPomodoros.checked
    ? (autoStartPomodorosCheck = true)
    : (autoStartPomodorosCheck = false);
  darkMode.checked ? (darkModeCheck = true) : (darkModeCheck = false);

  //Save the settings
  const savedSettings = {
    pomodoro: pomodoroTimeValue.value,
    shortBreak: shortBreakTimeValue.value,
    longBreak: longBreakTimeValue.value,
    autoStartBreaks: autoStartBreaksCheck,
    autoStartPomodoros: autoStartPomodorosCheck,
    longBreakTimeInterval: longBreakTimeIntervalValue,
    darkMode: darkModeCheck,
    tickingSound: selectedTickingSound ? selectedTickingSound.id : "",
    alarmSound: selectedAlarmSound.id,
    alarmRepetitionCount: alarmRepetition.value,
    alarmSoundName: selectedAlarmSoundName?.trim(),
    tickingSoundName: selectedTickingSoundName?.trim(),
  };
  localStorage.setItem("settings", JSON.stringify(savedSettings));
  //Stop the Sounds
  if (selectedSound) {
    if (!selectedSound.paused) {
      selectedSound.pause();
    }
  }
});
//Reset Settings
settingsReset.addEventListener("click", () => {
  //Reset the settings
  getDefaultSettings();
  //Reset the time and theme
  displayTimeAndMsg();
  //Clear localStorage
  localStorage.clear();
  //Reset the themes
  const defaultThemes = ["#ba4949", "#7d53a2", "#38858a"];
  [...themeColors.children].forEach((e, i) => {
    e.style.backgroundColor = defaultThemes[i];
  });
  //Set the timerThemes to the default
  defaultThemes.forEach((theme, i) => {
    timerThemes[Object.keys(timerThemes)[i]].color = theme;
  });
  // Set the colors on the squares of options
  [...themesChooser.children].forEach((e) => {
    e.style.backgroundColor = timerThemes[e.classList[0].split("_")[0]].color;
  });
  //Set the theme of the current option
  document.documentElement.style.setProperty(
    "--theme",
    timerThemes[currentOption.classList[0]].color
  );
});
//Set the colors on the squares of themesChooser
[...themesChooser.children].forEach((e) => {
  e.style.backgroundColor = timerThemes[e.classList[0].split("_")[0]].color;
});
//Set the colors on the squares of themeColorsContainer
[...themeColors.children].forEach((e) => {
  e.style.backgroundColor = e.dataset.color;
});
//To keep trace of which option to change its theme (pomodoro/short/long)
let currentOptionToChangeTheme;
//Added the click event on the the parent and used event delegation
themesChooser.addEventListener("click", (event) => {
  //Get the chosen color and check it
  //Check icon
  const chosenIcon = '<i class="fa-solid fa-check"></i>';
  //Function to find the color that is the same as the option's backgroundColor in order to place the check mark in it
  function getTheChosenColor(theme) {
    const chosen = [...themeColors.children].find(
      (e) =>
        window.getComputedStyle(e).backgroundColor ==
        window.getComputedStyle(theme).backgroundColor
    );
    return chosen;
  }
  const pomodoroChosenColor = getTheChosenColor(pomodoroTheme);
  const shortBreakChosenColor = getTheChosenColor(shortBreakTheme);
  const longBreakChosenColor = getTheChosenColor(longBreakTheme);
  //Remove the check from all the colors
  [...themeColors.children].forEach((theme) => {
    theme.firstElementChild ? theme.firstElementChild.remove() : "";
  });
  //Get the option based on the click target and set the message "Pick a color for" based on that and set the check icon on the chosen one
  event.target.className == "pomodoro_theme"
    ? ((currentOptionToChangeTheme = pomodoroTheme),
      (currentOptionIndicator.textContent = "Pomodoro"),
      pomodoroChosenColor.insertAdjacentHTML("afterbegin", chosenIcon))
    : event.target.className == "shortBreak_theme"
    ? ((currentOptionToChangeTheme = shortBreakTheme),
      (currentOptionIndicator.textContent = "Short Break"),
      shortBreakChosenColor.insertAdjacentHTML("afterbegin", chosenIcon))
    : event.target.className == "longBreak_theme"
    ? ((currentOptionToChangeTheme = longBreakTheme),
      (currentOptionIndicator.textContent = "Long Break"),
      longBreakChosenColor.insertAdjacentHTML("afterbegin", chosenIcon))
    : "";
  //Show the themeColorsContainer
  themeColorsContainer.classList.add("show");
  //CHange the backgroundColor
  //Added the click event on the the parent and used event delegation
  themeColors.addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-color")) {
      //Change the background color of the option
      currentOptionToChangeTheme.style.backgroundColor = e.target.dataset.color;
      //Remove the check from all the colors
      [...themeColors.children].forEach((theme) => {
        theme.firstElementChild ? theme.firstElementChild.remove() : "";
      });
      //Add the check to the chosen color
      e.target.insertAdjacentHTML("afterbegin", chosenIcon);
      //Hide the themeColorsContainer
      themeColorsContainer.classList.remove("show");
      //Change the theme color in the timerThemes object based on the chosen option
      let currentTimeThemeObject = Object.entries(timerThemes).find(
        (e) => e[1].theme == currentOptionToChangeTheme.classList[0]
      );
      timerThemes[currentTimeThemeObject[0]].color = e.target.dataset.color;
      //Save timer themes in  localStorage
      localStorage.setItem("timerThemes", JSON.stringify(timerThemes));
      //Set the correspondent theme
      document.documentElement.style.setProperty(
        "--theme",
        timerThemes[currentOption.classList[0]].color
      );
    }
  });
});
//Close the themeColorsContainer when clicking outside of it
themeColorsContainer.addEventListener("click", (e) => {
  if (e.target == e.currentTarget)
    themeColorsContainer.classList.remove("show");
});
//close the alarms dropdown when click on anything else
document.addEventListener("click", (e) => {
  if (
    e.target.closest(".alarm_sounds .dropdown__header") ||
    e.target.closest(".alarm_sounds .dropdown__body")
  )
    return;
  alarmSounds.classList.remove("drop");
});
//close the ticking dropdown when click on anything else
document.addEventListener("click", (e) => {
  if (
    e.target.closest(".ticking_sounds .dropdown__header") ||
    e.target.closest(".ticking_sounds .dropdown__body")
  )
    return;
  tickingSounds.classList.remove("drop");
});

//Make sure that the values are not negative
const numbers = document.querySelectorAll("[type='number']");
numbers.forEach((e) => {
  e.addEventListener("change", () => {
    if (e.value <= 0) {
      e.value = 1;
      if (e.className == "alarm_repetition") {
        e.value = 0;
      }
    }
  });
});
