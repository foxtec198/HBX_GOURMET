// Vars
// api = 'http://localhost:9560/gourmet/api/v1/'
api = 'https://api.hubbix.com.br/gourmet/api/v1/'
spinner = '<span class="spinner-border spinner-border-sm text-light" role="status"></span>'
green = '#5E8B60'

// Variaveis de Usuario
mat = sessionStorage.getItem('mat') 
cr = sessionStorage.getItem('cr')
gc = sessionStorage.getItem('gc')
cmd = sessionStorage.getItem('cmd')
nome = sessionStorage.getItem('display_name')

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
// Caixa
async function abrir_caixa(t){
    valor = document.getElementById('vl_ab_caixa').value
    if(valor){
        t.innerHTML = spinner
        dados = `{
            "valor": ${valor}
        }`
        req = await request('caixa', 'POST', dados)
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
    req = await request('caixa', 'GET')
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

async function aplicar_caixa(t){
    valor = document.getElementById('valor_ap_caixa').value
    t.innerHTML = spinner
    req = await request('caixa?valor=' + valor, 'PATCH')
    res = await req.json()
    if(req.ok){location.reload()}
    else{toast(res, 'erro'); t.textContent = 'Aplicar Valor'}
}

async function fechar_caixa(t){
    req = await request('caixa', 'DELETE')
    res = await req.json()
    if(req.ok){location.reload()}
    else{toast(res, 'erro')}

}

// Despesas
async function add_despesa(t){
    valor = document.getElementById('input_valor_despesa').value
    motivo = document.getElementById('input_motivo_despesa').value
    if(valor){
        if(motivo){
            data = `{
                "motivo": "${motivo}",
                "valor": ${valor}
            }`
            t.innerHTML = spinner
            req = await request('despesas', 'POST', data)
            res = await req.json()
            if(req.status === 200){location.reload()}
            else{
                toast(res, 'erro')
                t.textContent = 'Criar Despesa'
            }
        }else{toast('Motivo Obrigatório!', 'erro')}
    }else{toast('Valor Obrigatório!', 'erro')}
}

async function get_despesas(){
    req = await request('despesas')
    res = await req.json()
    if(res[0]){
        cont = 0
        res.forEach(item => {
            const id = item['id']
            const nome = item['motivo']
            const valor = item['valor']
            const data = item['data']
            const hora = item['hora']
            const dataAtual = new Date()
            const dataStr = dataAtual.toLocaleDateString('pt-br')

            if(dataStr === data){
                td = document.createElement('tr')
    
                trMotivo = document.createElement('td')
                trMotivo.textContent = nome
                trMotivo.classList.add('text-truncate')
    
                trValor = document.createElement('td')
                trValor.textContent = `R$ ${valor}`
                trValor.classList.add('text-truncate')

                trData = document.createElement('td')
                trData.textContent = data
                trData.classList.add('text-truncate')
    
                trHora = document.createElement('td')
                trHora.textContent = hora
                trHora.classList.add('text-truncate')
    
                // Remove Button
                trBtn = document.createElement('td')
    
                const btnRemove = document.createElement('btn')
                btnGp = document.createElement('div')
                btnGp.classList.add('btn-group')
    
                btnRemove.innerHTML = '<i class="bi bi-trash2-fill"></i>'
                btnRemove.classList.add('btn')
                btnRemove.classList.add('btn-sm')
                btnRemove.classList.add('btn-danger')
                btnRemove.addEventListener('click', async function(){
                    if(confirm('Deseja excluir essa despesa?')){
                        req = await request('despesas?id=' + id, 'DELETE')
                        if(req.status === 200){location.reload()}
                        else{toast(req.json(), 'erro')}
                    }
                })
                
                btnGp.appendChild(btnRemove)
                trBtn.appendChild(btnGp)
    
                td.appendChild(trMotivo)
                td.appendChild(trValor)
                td.appendChild(trData)
                td.appendChild(trHora)
                td.appendChild(trBtn)
    
                document.getElementById('tb_despesas').appendChild(td)
                cont += 1
            }
        })
        if(cont === 0){
            tr = document.createElement('tr')

            td = document.createElement('td')
            td.colSpan = 5
            td.classList.add('text-center')
            td.classList.add('fw-bold')
            td.classList.add('py-5')
            td.textContent = 'Nenhuma despesa cadastrada!'
    
            tr.appendChild(td)
            document.getElementById('tb_despesas').appendChild(td)
        }
    }else{
        tr = document.createElement('tr')

        td = document.createElement('td')
        td.colSpan = 5
        td.classList.add('text-center')
        td.classList.add('fw-bold')
        td.classList.add('py-5')
        td.textContent = 'Nenhuma despesa cadastrada!'

        tr.appendChild(td)
        document.getElementById('tb_despesas').appendChild(td)
    }

}

// Login
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

// Pedidos
async function get_pedidos(){
    req = await request('pedidos')
    res = await req.json()
    const tb_pedidos = document.getElementById('tb_pedidos')

    if(res[0]){
        res.forEach(item => {
            cmd = item['cmd']
            horario = item['data']
            func = item['func']

            const tr = document.createElement('tr')
        
            const tdCmd = document.createElement('td')
            tdCmd.textContent = cmd

            const tdHora = document.createElement('td')
            tdHora.textContent = horario

            const tdFunc = document.createElement('td')
            tdFunc.textContent = func
            
            tdGp = document.createElement('td')
            btnGp = document.createElement('div')
            btnGp.classList.add('btn-group')

            // Botao de Entregar
            btnEntrega = document.createElement('button')
            btnEntrega.classList.add('btn')
            btnEntrega.classList.add('btn-sm')
            btnEntrega.classList.add('btn-success')
            btnEntrega.innerHTML = '<i class="bi bi-plus-circle"></i>'

            // Botao de Visualizar
            btnView = document.createElement('button')
            btnView.classList.add('btn')
            btnView.classList.add('btn-sm')
            btnView.classList.add('btn-secondary')
            btnView.innerHTML = '<i class="bi bi-eye-fill"></i>'

            // Botao de Remover
            btnRemove = document.createElement('button')
            btnRemove.classList.add('btn')
            btnRemove.classList.add('btn-sm')
            btnRemove.classList.add('btn-danger')
            btnRemove.innerHTML = '<i class="bi bi-trash2-fill"></i>'

            btnGp.appendChild(btnEntrega)
            btnGp.appendChild(btnView)
            btnGp.appendChild(btnRemove)
            tdGp.appendChild(btnGp)
            
            
            tr.appendChild(tdCmd)
            tr.appendChild(tdHora)
            tr.appendChild(tdFunc)
            tr.appendChild(tdGp)
            tb_pedidos.appendChild(tr)

        })
    }else{
        const tr = document.createElement('tr')
        
        const td = document.createElement('td')
        td.textContent = 'Sem pedidos ainda!'
        td.colSpan = 4
        td.classList.add('text-center')
        td.classList.add('py-5')
        td.classList.add('fw-bold')

        tr.appendChild(td)
        tb_pedidos.appendChild(tr)
    }
}

// Produtos
async function get_prods(){
    req = await request('produtos')
    res = await req.json()

    if(res[0]){
        res.forEach(item => {
            const id = item['id']
            const nome = item['nome']
            const ctg = item['categoria']
            const quant = item['quantidade']
            const valor = item['valor']

            li_example = `
                <div class=" d-flex justify-content-between align-item-center">
                    <div class="d-flex flex-column">
                        <span class="fw-bold text-wrap">${nome}</span>
                        <span>R$ ${valor} - ${ctg}</span>
                    </div>
                    <div class="d-flex justify-content-center align-item-center text-center mb-auto">
                        <button class="btn btn-success"><i class="bi bi-plus fw-bold"></i></button>
                        <input type="number" value="0" style="width: 50px;" class="btn border form-control text-center">
                        <button class="btn btn-danger"><i class="bi bi-dash"></i></button>
                    </div>
                </div>`

            const li = document.createElement('li')
            li.classList.add('list-group-item')

            li.innerHTML = li_example

            document.getElementById('list_prods').appendChild(li)
        })
    }else{

    }
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
if(window.location.pathname !== '/' && !mat){window.location = '/'}
if(nome){try{document.getElementById('lbl_nome_usuario').textContent = nome}catch{}}
