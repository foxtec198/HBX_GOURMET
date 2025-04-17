// Vars
// api = 'http://localhost:9560/gourmet/api/v1/'
api = 'https://api.hubbix.com.br/gourmet/api/v1/'
mat = sessionStorage.getItem('mat')
cr = sessionStorage.getItem('cr')
gc = sessionStorage.getItem('gc')
cmd = sessionStorage.getItem('cmd')
nome = sessionStorage.getItem('display_name')
spinner = '<span class="spinner-border spinner-border-sm text-light" role="status"></span>'

if(nome){
    document.getElementById('lbl_nome_usuario').textContent = nome
}
if(!cmd){
    cmd = sessionStorage.setItem('cmd', false)
}
// Funções 

async function login(){
    mat = document.getElementById('mat').value
    pwd = document.getElementById('pwd').value
    if(mat){
        if(pwd){
            dd = `{'matricula': ${mat},'password': ${pwd}}`
            js = await fetch(api + 'login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'matricula': `${mat}`,
                    'password': `${pwd}`
                }
            })
            res = await js.json()
            if(js.ok){
                sessionStorage.setItem('display_name', res['nome'])
                sessionStorage.setItem('cr', res['cr'])
                sessionStorage.setItem('gc', res['gc'])
                sessionStorage.setItem('permissao', res['permissao'])
                sessionStorage.setItem('mat', res['matricula'])
                window.location = '/gourmet/base.html'
            }else{toast(res)}

        }else{toast('Senha obrigatória!')}
    }else{toast('Matricula obrigatória!')}
}

function logout(){
    sessionStorage.clear()
    location = '/'
}

function change_screen(screnn, t){
    others = document.querySelectorAll('.menu-item')
    others.forEach(element => {
        element.style.background = null
    });
    t.style.background = '#5E8B60'
    frame = document.getElementById('frame_screen')
    sessionStorage.setItem('frame', `/gourmet/${screnn}.html`)
    frame.src = `/gourmet/${screnn}.html`
}

function restore_screen(){
    frame = sessionStorage.getItem('frame')
    frameWidget = document.getElementById('frame_screen')

    if(frame){
        frameWidget.src = frame
    }else{
        frameWidget.src = `/gourmet/caixa.html`
        sessionStorage.setItem('frame', 'caixa.html')
    }
}

function toast(msg, type=null){
    tst = document.getElementById("snackbar");
    tst.textContent = msg
    tst.className = "show";
    if(type==='erro'){
        tst.style.background = '#c1121f'
    }else if(type='info'){
        tst.style.background = '#333'
    }else{
        tst.style.background = '#3a5a40'
    }

    setTimeout(function(){ tst.className = tst.className.replace("show", ""); }, 3000);
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