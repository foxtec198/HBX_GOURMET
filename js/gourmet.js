function logout(){
    sessionStorage.clear()
    location = '/'
}

function change_screen(screnn){
    frame = document.getElementById('frame_screen')
    sessionStorage.setItem('frame', `/gourmet/${screnn}.html`)
    frame.src = `/gourmet/${screnn}.html`
}
