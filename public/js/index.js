import '@babel/polyfill'

import { login, logout } from './login.js'
import { updateSettings } from './updateSettings.js'

const loginForm = document.querySelector('.form--login')
const logoutBtn = document.querySelector('.nav__el--logout')
const updateForm = document.querySelector('.form-user-data')
const updatePasswordForm = document.querySelector('.form-user-settings')

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const email = document.getElementById('email').value

    const password = document.getElementById('password').value

    login(email, password)
  })
}
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout)
}

if (updateForm) {
  updateForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const email = document.getElementById('email').value

    const name = document.getElementById('name').value

    updateSettings({ name, email }, 'data')
  })
}
if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    document.getElementById('btn--save-password').textContent = 'Updating...'

    const passwordCurrent = document.getElementById('password-current').value
    const password = document.getElementById('password').value
    const passwordConfirm = document.getElementById('password-confirm').value

    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password',
    )
    document.getElementById('btn--save-password').textContent = 'Save Password'

    document.getElementById('password-current').textContent = ''
    document.getElementById('password').textContent = ''
    document.getElementById('password-confirm').textContent = ''
  })
}
