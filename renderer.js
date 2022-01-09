const {ipcRenderer} = require('electron');
const hexColor = document.getElementById('hexColor')
const name = document.getElementById('nameInput')

hexColor.addEventListener('keyup', (event) => {
  if (hexColor.value.length === 6) {
    hexColor.value = hexColor.value.toUpperCase()
    sendColor(hexColor.value)
  }
})

function sendColor (color) {
  ipcRenderer.send('color-name', color)
}

function moveBar(i) {
  if (i == 0) {
    i = 1;
    var elem = document.getElementById("myBar");
    var width = 1;
    var id = setInterval(frame, 10);
    function frame() {
      if (width >= 100) {
        clearInterval(id);
        i = 0;
      } else {
        width++;
        elem.style.width = width + "%";
      }
    }
  }
}

ipcRenderer.on('move-bar', (event, arg) => {
  moveBar(arg)
})

ipcRenderer.on('show-bar', (event, arg) => {
  const myBar = document.getElementById('myBar')
  const myMsg = document.getElementById('myMsg')
  if (arg === 0) {
    myBar.style.display = 'none';
    myMsg.style.display = 'none';
  } else {
    myBar.style.display = 'block';
    myMsg.style.display = 'block';
  }
})

ipcRenderer.on('color-name-reply', (event, arg) => {
  const hex = document.getElementById('hexColor').value
  document.getElementById('nameInput').value = arg
  document.getElementById('button').innerText = 'CLEAR'
  document.getElementById('button').style.display = "block";
  if (arg === 'No name found') {
    document.getElementById('card-1').style.backgroundColor = '#FFF'
    document.getElementById('name-container').innerHTML = ''
    document.getElementById('button').innerText = 'SAVE'
    const n_match = ntc.name(hex);
    const n_name = n_match[1];
    const hexClosest = String(n_match[0]).substring(1);
    document.getElementById('name-container-nearest').innerHTML = hexClosest + ' - ' + n_name
    document.getElementById('card-2').style.backgroundColor = n_match[0]
    document.getElementById('card-1').style.backgroundColor = '#' + document.getElementById('hexColor').value
    document.getElementById('nameInput').disabled = false;
    document.getElementById('nameInput').focus()
    document.getElementById('nameInput').select()
  } else {
    document.getElementById('name-container-nearest').innerHTML = ' '
    document.getElementById('card-1').style.backgroundColor = '#' + hex.toUpperCase()
    document.getElementById('card-2').style.backgroundColor = '#FFF'
    document.getElementById('name-container').innerHTML = hex + ' - ' + arg
    document.getElementById('nameInput').disabled = true;
  }
})

function handleButton () {
  function clear() {
    document.getElementById('hexColor').value = ''
    document.getElementById('nameInput').value = ''
    document.getElementById('name-container').innerHTML = ''
    document.getElementById('name-container-nearest').innerHTML = ''
    document.getElementById('hexColor').focus()
    document.getElementById('button').innerText = 'CLEAR'
    document.getElementById('button').style.display = "none";
    document.getElementById('card-1').style.backgroundColor = '#FFF'
    document.getElementById('card-2').style.backgroundColor = '#FFF'
  }

  function save() {
    const color = {
      hex: `"${document.getElementById('hexColor').value}"`,
      name: `"${document.getElementById('nameInput').value}"`
    }
    ipcRenderer.send('add-color', color)
  }

  if (document.getElementById('button').innerText === 'SAVE') { save() }
  clear()
}

