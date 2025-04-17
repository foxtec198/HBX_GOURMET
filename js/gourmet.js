// Vars
api = 'http://localhost:9560/gourmet/api/v1/'
// api = 'https://api.hubbix.com.br/gourmet/api/v1/'
spinner = '<span class="spinner-border spinner-border-sm text-light" role="status"></span>'
green = '#5E8B60'

// Variaveis de Usuario
mat = sessionStorage.getItem('mat') 
cr = sessionStorage.getItem('cr')
gc = sessionStorage.getItem('gc')
cmd = sessionStorage.getItem('cmd')
nome = sessionStorage.getItem('display_name')

if(window.location.pathname !== '/' && !mat){window.location = '/'}
if(nome){try{document.getElementById('lbl_nome_usuario').textContent = nome}catch{}}


// Funções ------------------------------------------------------------------------------------------------------- 
// Realiza o Logout limpando os caches e voltando para o login
function logout(){
    sessionStorage.clear()
    location = '/'
}

// Troca de Frame e seta cor no Menu Button
function change_screen(screnn, t=null){
    others = document.querySelectorAll('.menu-item')
    others.forEach(element => {
        element.style.background = null
    });
    if(t){t.style.background = green}
    frame = document.getElementById('frame_screen')
    sessionStorage.setItem('frame', `/gourmet/${screnn}.html`)
    frame.src = `/gourmet/${screnn}.html`
}

// Recupera a tela mesmo que atualize a pagina
function restore_screen(){
    frame = sessionStorage.getItem('frame')
    frameWidget = document.getElementById('frame_screen')
    
    if(frame){
        txt1 = frame.replace('/gourmet/', '')
        txt2 = txt1.replace('.html', '')
        frameWidget.src = frame
        document.getElementById(`menu_${txt2}`).style.background = green
    }
}

// Gera um snackbar personalizavel
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

// Função que simplifica o fetch!
function request(url, method='GET', json){
    if(!json){
        var options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'cr' : `${cr}`,
                'gc' : `${gc}`,
                'mat': `${mat}`,
                'perm': `${perm}`
            }
        };
    }else{
        var options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'cr' : `${cr}`,
                'gc' : `${gc}`,
                'mat': `${mat}`,
                'perm': `${perm}`
            },
            body: json
        };
    }
    return fetch(api + url, options)
}

// Função de Envio de Formulario
function send_form(url, form){
    var options = {
        method: 'POST',
        headers: {
            'cr' : `${cr}`,
            'gc' : `${gc}`,
            'mat': `${mat}`,
            'perm': `${perm}`
        },
        body: form
    }
    return fetch(api + url, options)
}

// Callbacks API ---------------------------------------------------------------------------------------------
async function abrir_caixa(t){
    valor = document.getElementById('vl_ab_caixa').value
    if(valor){
        t.innerHTML = spinner
        dados = `{
            "valor": ${valor}
        }`
        req = await request('abrir_caixa', 'POST', dados)
        res = await req.json()
        
        if(req.ok){
            location.reload()
        }else{toast(res)}
        t.textContent = 'Abrir Caixa'
    }else{
        toast('Valor inicial vazio!', 'erro')
    }
}

async function status_caixa(){
    req = await request('conferir_caixa', 'POST')
    res = await req.json()
    st = document.getElementById('caixa_status')
    st.classList.remove('placeholder')

    if(res){
        st.classList.add('text-bg-success')
        st.textContent = `Caixa Aberto - R$${res}`
    }else{
        st.classList.add('text-bg-danger')
        st.textContent = `Caixa Fechado - R$0`
        
    }
}

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

// Controle de Permissao ----------------------------------------------------------------------------------------------
perm = sessionStorage.getItem('permissao')
if(perm){
    if(perm === 'FUNC' || perm === 'GRC'){
        document.getElementById('link_caixa').hidden = 'none'
        document.getElementById('link_relatorios').hidden = 'none'
        document.getElementById('link_config').hidden = 'none'
        
        mb_caixa = document.getElementById('mobile_caixa')
        mb_caixa.classList.remove('d-flex')
        mb_caixa.style.display = 'none'
        document.getElementById('mobile_relatorios').hidden = 'none'
        document.getElementById('mobile_config').hidden = 'none'
    }
}
if(!cmd){cmd = sessionStorage.setItem('cmd', false)}
