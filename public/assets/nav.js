const settings = require('electron-settings')

document.body.addEventListener('click', (event) => {
  if (event.target.dataset.section) {
    handleSectionTrigger(event)
  } else if (event.target.dataset.modal) {
    handleModalTrigger(event)
  } else if (event.target.classList.contains('modal-hide')) {
    hideAllModals()
  }
})

function handleSectionTrigger (event) {
  // hideAllSectionsAndDeselectButtons()

  // // Highlight clicked button and show view
  // event.target.classList.add('is-selected')

  // // Display the current section
  // const sectionId = `${event.target.dataset.section}-section`
  // console.log(sectionId)
  // document.getElementById(sectionId).classList.add('is-shown')

  // // Save currently active button in localStorage
  // const buttonId = event.target.getAttribute('id')
  // settings.set('activeSectionButtonId', buttonId)
}

function activateDefaultSection () {
  document.getElementById('button-dataEx').click()
}

function showMainContent () {
  document.querySelector('.js-nav').classList.add('is-shown')
  document.querySelector('.js-content').classList.add('is-shown')
}

function handleModalTrigger (event) {
  hideAllModals()
  const modalId = `${event.target.dataset.modal}-modal`
  document.getElementById(modalId).classList.add('is-shown')
}

function hideAllModals () {
  const modals = document.querySelectorAll('.modal.is-shown')
  Array.prototype.forEach.call(modals, (modal) => {
    modal.classList.remove('is-shown')
  })
  showMainContent()
}

function hideAllSectionsAndDeselectButtons () {
  const sections = document.querySelectorAll('.js-section.is-shown')
  Array.prototype.forEach.call(sections, (section) => {
    section.classList.remove('is-shown')
  })

  // const buttons = document.querySelectorAll('.nav-button.is-selected')
  const buttons = document.querySelectorAll('.nav-button.is-selected')
  Array.prototype.forEach.call(buttons, (button) => {
    button.classList.remove('is-selected')
  })
}

showMainContent()
// Default to the view that was active the last time the app was open
// const sectionId = settings.get('activeSectionButtonId')
// if (sectionId) {
//   showMainContent()
//   const section = document.getElementById(sectionId)
//   if (section) section.click()
// } else {
//   activateDefaultSection()
// }

function addClassProcess(id){
  let target = $('#'+id);
  hideAllSectionsAndDeselectButtons();
  // Highlight clicked button and show view
  target.addClass('is-selected');

  // Display the current section
  // const sectionId = `${e.target.dataset.section}-section`
  const sectionId = target.data('section')+'-section';
  console.log(sectionId);
  document.getElementById(sectionId).classList.add('is-shown');
}

$('#button-config').on('click',(e)=>{
  hideChart('#run-section .svg-container');
  hideChart('#seqEditor-section .svg-container');
  hideChart('#report-section .svg-container');
  addClassProcess('button-config');
})

$('#button-seqEditor').on('click',(e)=>{
  hideChart('#run-section .svg-container');
  // hideChart('#seqEditor-section .svg-container');
  hideChart('#report-section .svg-container');
  showChart('#seqEditor-section .svg-container');
  addClassProcess('button-seqEditor');
})

$('#button-run').on('click',(e)=>{
  hideChart('#report-section .svg-container');
  hideChart('#seqEditor-section .svg-container');
  showChart('#run-section .svg-container');
  addClassProcess('button-run');
})

$('#button-report').on('click',(e)=>{
  hideChart('#run-section .svg-container');
  hideChart('#seqEditor-section .svg-container');
  // hideChart('#report-section .svg-container');
  showChart('#report-section .svg-container');
  addClassProcess('button-report');
})

function hideChart(selectors){
  let charts = document.querySelectorAll(selectors);
  charts.forEach((item,index)=>{
    $(item).hide()
  })
}

function showChart(selectors){
  let charts = document.querySelectorAll(selectors);
  charts.forEach((item,index)=>{
    $(item).show()
  })
}
