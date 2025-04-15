// Vars
api = 'https://effective-doodle-q6q569pqw75fx5pg-9560.app.github.dev/gourmet/api/v1/'
// api = 'https://api.hubbix.com.br/gourmet/api/v1/'
mat = sessionStorage.getItem('mat')
cr = sessionStorage.getItem('cr')
gc = sessionStorage.getItem('gc')
spinner = '<span class="spinner-border spinner-border-sm text-light" role="status"></span>'

// Funções 
function logout(){
    sessionStorage.clear()
    location = '/'
}

function change_screen(screnn){
    frame = document.getElementById('frame_screen')
    sessionStorage.setItem('frame', `/gourmet/${screnn}.html`)
    frame.src = `/gourmet/${screnn}.html`
}

function toast(msg, type='info'){
    tst = document.getElementById('toast_html')
    if(type==='info'){
        tst.classList.add('text-bg-info')
    }else if(type==='erro'){
        tst.classList.add('text-bg-danger')
    }else if(type==='sucesso'){
        tst.classList.add('text-bg-success')
    }

    title = document.getElementById('title_toast')
    title.textContent = msg

    $(document).ready(function(){
        $('.toast').toast('show');
    });
}

// Callbacks API
function request(url, method='GET', json){
    if(!json){
        var options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'cr' : `${cr}`,
                'gc' : `${gc}`,
                'mat': `${mat}`
            }
        };
    }else{
        var options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'cr' : `${cr}`,
                'gc' : `${gc}`,
                'mat': `${mat}`
            },
            body: json
        };
    }
    return fetch(api + url, options)
}

function send_form(url, form){
    var options = {
        method: 'POST',
        headers: {
            'cr' : `${cr}`,
            'gc' : `${gc}`,
            'mat': `${mat}`
        },
        body: form
    }
    return fetch(api + url, options)
}

async function abrir_caixa(t){
    valor = document.getElementById('vl_ab_caixa').value
    if(valor){
        t.innerHTML = spinner
        dados = `{
            "valor": ${valor}
        }`
        req = await request('abrir_caixa', 'POST', dados)
        res = await req.json()
        
        console.log(res)
        t.textContent = 'Abrir Caixa'
    }else{
        toast('Valor inicial vazio!', 'erro')
    }
}