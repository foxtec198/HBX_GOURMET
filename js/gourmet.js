function logout(){
    sessionStorage.clear()
    location = '/'
}

function change_screen(screnn){
    frame = document.getElementById('frame_screen')
    frame.src = `/gourmet/${screnn}.html`
}