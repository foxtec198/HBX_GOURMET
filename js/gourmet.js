// Vars
api = 'http://localhost:9560/gourmet/api/v1/'
// api = 'https://api.hubbix.com.br/gourmet/api/v1/'
spinner = '<span class="spinner-border spinner-border-sm text-light" role="status"></span>'
green = '#5E8B60'
lixeira = '<i class="bi bi-trash2-fill"></i>'
loader = '<div class="loader"> <div class="justify-content-center jimu-primary-loading"></div> </div>' 

// Variaveis de Usuario
mat = sessionStorage.getItem('mat') 
cr = sessionStorage.getItem('cr')
gc = sessionStorage.getItem('gc')
cmd = sessionStorage.getItem('cmd')
nome = sessionStorage.getItem('display_name')
lds = document.createElement('div')

div = document.createElement('div')
div.id = 'snackbar'
document.body.appendChild(div)

// Funções ------------------------------------------------------------------------------------------------------- 
// Realiza o Logout limpando os caches e voltando para o login
function logout(){
    sessionStorage.clear()
    location = '/'
}

function real(str){
    return str.toLocaleString('pt-br', {style:'currency', currency:'BRL'})
}

function show_ldg(){
    lds.hidden = ''
    lds.style.width = '100%'
    lds.style.height = '100%'
    lds.style.background = '#2B3035'
    lds.innerHTML = loader
    lds.style.position = 'absolute'
    lds.style.top = 0
    document.body.appendChild(lds)
}

function close_ldg(){
    lds.hidden = 'none'
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

function alertInApp(msg, type='success'){
    const al = document.getElementById('alertInApp')
    al.classList.add('alert-'+type)
    document.getElementById('alertMsg').textContent = msg
    al.hidden = ''
    setTimeout(function(){al.hidden = 'none'}, 3000)

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

async function get_caixa(){
    req = await request('caixa', 'GET')
    res = await req.json()

    return res
}

async function status_caixa(){
    res = await get_caixa()
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

async function last_value(){
    req = await request('last_value', 'POST')
    res = await req.json()
    if(Object.keys(res).length > 0){
        document.getElementById('vl_ab_caixa').value = res[0]
    }else{
        document.getElementById('vl_ab_caixa').value = ''
    }
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
            const data = new Date(item['data'])
            const hora = item['hora']
            const dataAtual = new Date()
            const dataStr = dataAtual.toLocaleDateString('pt-br')

            if(dataStr === data.toLocaleDateString('pt-br')){
                td = document.createElement('tr')
    
                trMotivo = document.createElement('td')
                trMotivo.textContent = nome
                trMotivo.classList.add('text-truncate')
    
                trValor = document.createElement('td')
                trValor.textContent = `R$ ${valor}`
                trValor.classList.add('text-truncate')

                trData = document.createElement('td')
                trData.textContent = data.toLocaleDateString('pt-br', {day:'numeric', month:'long'})
                trData.classList.add('text-truncate')
    
                trHora = document.createElement('td')
                trHora.textContent = hora
                trHora.classList.add('text-truncate')
    
                // Remove Button
                trBtn = document.createElement('td')
    
                const btnRemove = document.createElement('btn')
                btnGp = document.createElement('div')
                btnGp.classList.add('btn-group')
    
                btnRemove.innerHTML = lixeira
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
            show_ldg()
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
            }else{
                close_ldg()
                toast(res)
            }

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
            cli = item['cli']
            func = item['func']

            const tr = document.createElement('tr')
        
            const tdCmd = document.createElement('td')
            tdCmd.textContent = cmd

            const tdCli = document.createElement('td')
            tdCli.textContent = cli
            tdCli.classList.add("text-truncate")

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
            btnEntrega.addEventListener('click',async function(){
                dd = {'cmd':cmd, 'mat': mat}
                req = await request('pedidos', 'PATCH', JSON.stringify(dd))
                res = await req.json()
                
                if(req.ok){location.reload()}
                else{toast(res)}
            })

            // Botao de Visualizar
            btnView = document.createElement('button')
            btnView.classList.add('btn')
            btnView.classList.add('btn-sm')
            btnView.classList.add('btn-secondary')
            btnView.innerHTML = '<i class="bi bi-eye-fill"></i>'
            btnView.addEventListener('click', async function(){
                document.getElementById('label_modal_pedidos').textContent = `Pedidos Comanda: ${cmd}.`
                const lp = document.getElementById('list_pedidos')
                lp.innerHTML = ''
                data = {'cmd': cmd}
                req = await request('prods_pedidos', 'POST', JSON.stringify(data))
                res = await req.json()
                
                if(req.ok){
                    res.forEach(item => {
                        id = item['id']
                        idp = item['idp']
                        prod = item['prod']
                        quant = item['quant']
                        st = item['status']

                        li = document.createElement('li')
                        li.classList.add('list-group-item')
    
                        dv = document.createElement('div')
                        dv.classList.add('d-flex')
                        dv.classList.add('justify-content-between')
                        dv.classList.add('align-items-center')
    
                        sp = document.createElement('span')
                        sp.innerHTML = `${prod} - ${quant}Un.`

                        badge = document.createElement('span')
                        badge.textContent = st
                        badge.classList.add('badge')
                        badge.classList.add('text-bg-success')

                        // Botao Cancelamento de Produto e nao do pedido do todo
                        btn = document.createElement('button')
                        btn.classList.add('btn')
                        btn.classList.add('btn-sm')
                        btn.classList.add('btn-danger')
                        btn.innerHTML = lixeira
                        btn.addEventListener('click', async function(){
                            if(confirm('Deseja realmente cancelar este produto?')){
                                dd = {'id':id, 'cmd':cmd, 'idp':idp}
                                req = await request('rm_order_only', 'DELETE', JSON.stringify(dd))
                                res = await req.json()
                                if(req.ok){location.reload()}
                                else{toast(res, 'erro')}
                            }
                        })

                        dv.appendChild(sp)
                        dv.appendChild(badge)
                        dv.appendChild(btn)
                        
                        li.appendChild(dv)

                        lp.appendChild(li)
                    })
                }

                const modal = new bootstrap.Modal('#modal_view')
                modal.show()
            })

            // Botao de Remover
            btnRemove = document.createElement('button')
            btnRemove.classList.add('btn')
            btnRemove.classList.add('btn-sm')
            btnRemove.classList.add('btn-danger')
            btnRemove.innerHTML = lixeira
            btnRemove.addEventListener('click', async function(){
                if(confirm('Deseja realmente Cancelar este pedido?')){
                    btnRemove.innerHTML = spinner
                    data = {"cmd": cmd}
                    req = await request('pedidos', 'DELETE', JSON.stringify(data))
                    res = await req.json()
                    if(req.ok){location.reload()}
                    else{toast(res)}
                }
            })
            console.log()
            btnGp.appendChild(btnEntrega)
            btnGp.appendChild(btnView)
            btnGp.appendChild(btnRemove)
            tdGp.appendChild(btnGp)
            
            
            tr.appendChild(tdCmd)
            tr.appendChild(tdCli)
            tr.appendChild(tdFunc)
            tr.appendChild(tdGp)
            tb_pedidos.appendChild(tr)

        })
    }else{
        const tr = document.createElement('tr')
        
        const td = document.createElement('td')
        td.textContent = 'Sem pedidos ainda!'
        td.colSpan = 5
        td.classList.add('text-center')
        td.classList.add('fw-bold')
        td.style.paddingBottom = '100px'
        td.style.paddingTop = '100px'

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

            if(quant > 0){
                li_example = `
                    <div class=" d-flex justify-content-between align-item-center">
                        <div class="d-flex flex-column">
                            <span class="fw-bold text-wrap">${nome}</span>
                            <span>R$${parseFloat(valor)} - Categoria: ${ctg} - Quantidade: ${quant}</span>
                        </div>
                        <div class="d-flex justify-content-center align-item-center text-center mb-auto">
                            <button onclick="add_prod(this, ${id})" id="btnAdd${id}" class="btn btn-success"><i class="bi bi-plus fw-bold"></i></button>
                            <input class="prods" name="${id}" id="input_prod${id}" type="number" readonly value="0" style="width: 50px;" class="btn border form-control text-center">
                            <button onclick="rmv_prod(this, ${id})" class="btn btn-danger"><i class="bi bi-dash"></i></button>
                        </div>
                    </div>`
            }else if(quant <= 0){
                li_example = `
                <div class=" d-flex justify-content-between align-item-center">
                    <div class="d-flex flex-column flex-grow-1">
                        <span class="fw-bold text-wrap">${nome}</span>
                        <span>R$${parseFloat(valor)} - Categoria: ${ctg} - Quantidade: ${quant}</span>
                    </div>
                    <div class="d-flex justify-content-center align-item-center text-center mb-auto">
                        <span class="badge w-100 text-bg-danger rounded-pill">Estoque Vazio!</span>
                    </div>
                </div>`
            }
            const li = document.createElement('li')
            li.classList.add('list-group-item')

            li.innerHTML = li_example

            document.getElementById('list_prods').appendChild(li)
        })
    }else{

    }
}

async function add_prod(t, id){
    t.innerHTML = spinner
    input = document.getElementById('input_prod' + id)
    input.value = parseInt(input.value) + 1

    data = {"id": id}
    req = await request('rmv_prod', 'POST', JSON.stringify(data))
    res = await req.json()
    if(req.ok){
        t.innerHTML = '<i class="bi bi-plus fw-bold"></i>'
        if(res - parseInt(input.value) === 0){
            t.disabled = true
            toast('Estoque excedido')
        }
    }
}

async function rmv_prod(t, id){
    input = document.getElementById('input_prod' + id)
    document.getElementById('btnAdd' + id).disabled = false
    if(input.value > 0){
        t.innerHTML = spinner
        input.value = parseInt(input.value) - 1
    
        data = {"id": id}
        req = await request('add_prod', 'POST', JSON.stringify(data))
        res = await req.json()
        if(req.ok){
            t.innerHTML = '<i class="bi bi-dash" disable></i>'
        }
    }else{input.value = 0}
 }

async function enviar_prods(t=null){
    cmd = document.getElementById('cmdIn').value
    cli = document.getElementById('cliIn').value
    objs = document.querySelectorAll(".prods")
    data = {"cmd": cmd, "cliente":cli}
    prods = {}

    objs.forEach(item=>{
        if(item.value > 0){
            prods[item.name] = {"quantidade": parseInt(item.value)}
        }
    })

    data["items"] = prods

    if(cmd){
        if(Object.keys(prods).length > 0){
            if(t){t.innerHTML = spinner}
            req = await request("pedidos", "POST", JSON.stringify(data))
            res = await req.json()
            if(req.ok){
                window.location = '/gourmet/pedidos.html'
            }
            else{
                t.textContent = 'Novo Pedido'
                toast(res)
            }
        }else{toast('Selecione algum produto!')}
    }else{toast('Comanda ou Mesa obrigatoria!')}

    
}

// Comandas
async function get_cmds(){
    req = await request('comandas')
    res = await req.json()
    const tb_cmds = document.getElementById('tb_comandas')

    if(Object.keys(res).length > 0){
        res.forEach(item => {
            cliente = item['cliente']
            cmd = item['cmd']
            func = item['func']
            valor = item['valor']

            const tr = document.createElement('tr')

            const tdCmd = document.createElement('td')
            tdCmd.textContent = cmd
            tr.appendChild(tdCmd)

            const tdCliente = document.createElement('td')
            tdCliente.textContent = cliente
            tdCliente.classList.add('text-truncate')
            tr.appendChild(tdCliente)

            
            const tdValor = document.createElement('td')
            tdValor.textContent = parseFloat(valor).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
            tr.appendChild(tdValor)

            const tdFunc = document.createElement('td')
            tdFunc.textContent = func
            tr.appendChild(tdFunc)

            const tdBtn = document.createElement('td')
            const divBtn = document.createElement('div')
            divBtn.classList.add('btn-group')

            
            // Btn Abrir
            const btnAbrirCmd = document.createElement('button')
            btnAbrirCmd.classList.add('btn')
            btnAbrirCmd.classList.add('btn-sm')
            btnAbrirCmd.classList.add('btn-success')
            btnAbrirCmd.innerHTML = '<i class="bi bi-box-arrow-up-right"></i>'
            divBtn.appendChild(btnAbrirCmd)
            btnAbrirCmd.addEventListener('click', async function(){
                location = '/gourmet/cmd.html?cmd='+cmd
            })

            // Btn de Cancelamento
            const btnCancelarCmd = document.createElement('button')
            btnCancelarCmd.classList.add('btn')
            btnCancelarCmd.classList.add('btn-sm')
            btnCancelarCmd.classList.add('btn-danger')
            btnCancelarCmd.innerHTML = lixeira
            btnCancelarCmd.addEventListener('click', async function(){
                if(confirm('Deseja realmente cancelar esta comanda?')){
                    dd = {'cmd':cmd}
                    req = await request('comandas', 'DELETE', JSON.stringify(dd))
                    res = await req.json()
                    if(req.ok){location.reload()}
                    else{toast(res)}
                }
            })

            divBtn.appendChild(btnCancelarCmd)

            tdBtn.appendChild(divBtn)
            tr.appendChild(tdBtn)


            tb_cmds.appendChild(tr)
        })
    }else{
        const tr = document.createElement('tr')
        
        const td = document.createElement('td')
        td.textContent = 'Sem comandas!'
        td.colSpan = 5
        td.classList.add('text-center')
        td.classList.add('fw-bold')
        td.style.paddingBottom = '100px'
        td.style.paddingTop = '100px'

        tr.appendChild(td)
        tb_cmds.appendChild(tr)
    }
    
}

async function mount_cmd_panel(dd){
    req = await request('get_cmd', 'POST', dd)
    res = await req.json()
    if(req.ok){
        cmd = res['cmd']
        cli = res['cli']
        func = res['func']
        data = new Date(res['data']) 
        total = res['total']
        prods = res['prods']

        lblCmd = document.getElementById('lbl_cmd')
        lblCmd.classList.remove('placeholder')
        lblCmd.innerHTML = lblCmd.innerHTML + cmd

        bdCli = document.getElementById('bdCli')
        bdCli.innerHTML = `${bdCli.innerHTML} ${cli}`

        bdFunc = document.getElementById('bdFunc')
        bdFunc.innerHTML = `${bdFunc.innerHTML} ${func}`

        bdVl = document.getElementById('bdVl')
        bdVl.innerHTML = `${bdVl.innerHTML} ${total.toLocaleString('pt-br', {style:'currency', currency: 'BRL'})}`

        bdDt = document.getElementById('bdDt')
        bdDt.innerHTML = `${bdDt.innerHTML} ${data.toLocaleDateString('pt-br', {month: 'long', day: 'numeric', hour:'numeric', minute:'numeric'})}`

        list_itens = document.getElementById('list_itens')
        prods.forEach(item=>{
            prod = item['nome']
            func = item['func']
            valor = item['valor']
            quant = item['quant']
            hora = item['hora']
            st = item['status']

            li = document.createElement('li')
            li.classList.add('list-group-item')

            dvM = document.createElement('div')
            dvM.classList.add('d-flex')
            dvM.classList.add('flex-row')
            dvM.classList.add('justify-content-between')
            dvM.classList.add('aling-items-center')

            dv = document.createElement('div')
            dv.classList.add('d-flex')
            dv.classList.add('flex-column')
            dv.classList.add('gap-1')

            sp = document.createElement('span')
            sp.textContent = `${quant} ${prod} - ${real(valor)}`
            sp.style.fontSize = '14px'

            sp2 = document.createElement('span')
            sp2.innerHTML = `
                <i class="bi bi-person"></i> ${nome}<br>
                <i class="bi bi-clock"></i> ${hora}
                `
            sp2.style.fontSize = '12px'

            dv.appendChild(sp)
            dv.appendChild(sp2)
            dvM.appendChild(dv)

            dv2 = document.createElement('div')
            sp3 = document.createElement('span')
            sp3.classList.add('badge')
            sp3.classList.add('rounded-pill')

            if(st === 'ENTREGUE'){sp3.classList.add('text-bg-success')}
            else if(st === 'SOLICITADO'){sp3.classList.add('text-bg-info')}
            else if(st === 'CANCELADO'){sp3.classList.add('text-bg-danger')}

            sp3.innerHTML = `<i class="bi bi-clipboard2-check-fill"></i> ${st}`
            dv2.appendChild(sp3)
            dvM.appendChild(dv2)

            li.appendChild(dvM)
            list_itens.appendChild(li)

            document.getElementById('btn_close').addEventListener('click', async function(){
                const modal = new bootstrap.Modal('#modal_close')
                modal.show()
            })
            
            document.getElementById('btn_cancel').addEventListener('click', async function(){
            })
        })

        document.getElementById('label_modal').textContent = 'Valor Total: ' + real(total)

        mb = document.getElementById('modal-body')

        const in_desc = document.getElementById("in_desc")
        in_desc.oninput = function(){
            if(in_desc.value > total){
                in_desc.value = total
                alertInApp(
                    'Valor de desconto nao deve ser maior que o valor!',
                    'danger'
                )
            }
        }

        const ck = document.getElementById('pagPartial')
        ck.onchange = function(){
            const t = document.getElementById('div_pag')
            const t2 = document.getElementById('div_pag_partial')

            if(ck.checked){
                t.hidden = 'none'
                t2.hidden = ''
            }else if(!ck.checked){
                t.hidden = ''
                t2.hidden = 'none'
            }
        }

        
        flPg = document.getElementById('faltPag')
        valorPago = 0

        pgDeb = document.getElementById('pagPartialDeb')
        pgDeb.onchange = function(){
            res = total - pgDeb.value
            if(pgDeb.value > 0){
                flPg.textContent = 'Falta pagar: ' + real(res)
                valorPago += pgDeb.value
            }
        }

        pgCred = document.getElementById('pagPartialCred')
        pgCred.onchange = function(){
            res = total - pgCred.value
            if(pgCred.value > 0){
                flPg.textContent = 'Falta pagar: ' + real(res)
                valorPago += pgCred.value
            }
        }
        
        pgPix = document.getElementById('pagPartialPix')
        pgPix.onchange = function(){
            res = total - pgPix.value
            if(pgPix.value > 0){
                flPg.textContent = 'Falta pagar: ' + real(res)
                valorPago += pgPix.value
            }
        }

        pdDin = document.getElementById('pagPartialDinheiro')
        pgDin.onchange = function(){
            res = total - pgDin.value
            if(pgDin > 0){
                flPg.textContent = 'Falta pagar: ' + real(res)
                valorPago += pgDin.value
            }
        }

    }else{toast(res, 'erro')}
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


// JQuery ----------------------------------------------------------------------------

$(document).ready(function(){
    $(".tel-mask").inputmask("(99) 99999-9999");
});

$(document).ready(function(){
    $(".money-mask").inputmask("currency");
});