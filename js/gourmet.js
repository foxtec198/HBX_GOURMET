// Vars
server = 'https://api.hubbix.com.br/'
// server = 'http://localhost:9560/'
api = server + 'gourmet/api/v1/'

const spinner = '<span class="spinner-border spinner-border-sm text-light" role="status"></span>'
const green = '#5E8B60'
const lixeira = '<i class="bi bi-trash2-fill"></i>'
const icon_edit = '<i class="bi bi-pencil-square"></i>'
const loader = '<div class="loader"> <div class="justify-content-center jimu-primary-loading"></div> </div>' 
const cart = new Object;

// Variaveis de Usuario =================================================================================
const mat = sessionStorage.getItem('mat') 
const cr = sessionStorage.getItem('cr')
const gc = sessionStorage.getItem('gc')
const nome = sessionStorage.getItem('display_name')
const lds = document.createElement('div')

const div = document.createElement('div')
div.id = 'snackbar'
document.body.appendChild(div)

const bodyHtml = document.body.innerHTML

const socket = io(server);
socket.on('action', function(tipo) {
    const frame = sessionStorage.getItem('frame').replace("/gourmet/", "").replace(".html", "")

    if(tipo == "venda" && frame == 'vendas'){location.reload()}
    if(tipo == "pedido" && frame == 'pedidos'){location.reload()}
    if(tipo == "comanda" && frame == 'comandas'){location.reload()}
});


// Funções ================================================================================= 

// Realiza o Logout limpando os caches e voltando para o login
function logout(){
    sessionStorage.clear()
    location = '/'
}

function imgPreview(file, prev){
    const fileInput = document.getElementById(file)
    const preview = document.getElementById(prev)

    fileInput.addEventListener('change', function () {
        const file = this.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (e) {
                preview.src = e.target.result;
            };

            reader.readAsDataURL(file);
        }else{
            preview.src = server + 'img/blank.png'
        }
    });

}

function ed_calc_lucro(){
    const valorIn = document.getElementById('ed_valor')
    const valor = valorIn.value

    const custoIn = document.getElementById('ed_custo')
    const custo = custoIn.value

    const btn = document.getElementById('btnEditProd')

    const lucro = valor - custo
    const mlucro = ((valor - custo)/ custo) * 100

    if(lucro <= 0){
        toast("Valor não deve ser menor ou igual que o lucro")
        btn.disabled = true
        document.getElementById('ed_lucro').value = ''
        document.getElementById('ed_mlucro').value = ''
    }else{
        document.getElementById('ed_lucro').value = lucro
        document.getElementById('ed_mlucro').value = mlucro.toFixed(1) + '%'
        btn.disabled = false
    }


}

function calc_lucro(){
    const valorIn = document.getElementById('valor')
    const valor = valorIn.value

    const custoIn = document.getElementById('custo')
    const custo = custoIn.value

    const btn = document.getElementById('btnNewProd')

    const lucro = valor - custo
    const mlucro = ((valor - custo)/ custo) * 100

    if(lucro <= 0){
        toast("Valor não deve ser menor ou igual que o lucro")
        btn.disabled = true
        document.getElementById('lucro').value = ''
        document.getElementById('mlucro').value = ''
    }else{
        document.getElementById('lucro').value = lucro
        document.getElementById('mlucro').value = mlucro.toFixed(1) + '%'
        btn.disabled = false
    }


}

function create_modal(id, title, body, backdrop = true, center='modal-dialog-centered modal-fullscreen'){
    const container = parent.document.createElement('div')
    const modalHtml = `
        <div class="modal fade" id="${id}" data-bs-keyboard="true" tabindex="-1">
            <div class="modal-dialog ${center}">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${title}</h5>
                </div>
                <div class="modal-body">
                    ${body}
                </div>
            </div>
            </div>
        </div>
    `;
    container.innerHTML = modalHtml
    document.body.appendChild(container)
    return new bootstrap.Modal(document.getElementById(id), {'show':true, 'backdrop': backdrop})
}

function get_modal(id){
    return new bootstrap.Modal(document.getElementById(id), {'show':true, 'backdrop': true})
}

async function excluir_venda(id){
    if(confirm("Deseja excluir esta venda, permanentemente?")){
        const req = await request('vendas', 'DELETE', JSON.stringify({id: id}))
        const res = await req.json()
    
        if(req.ok){location.reload()}
        else{toast(res)}
    }
}

function real(str){
    str = parseFloat(str)
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
    // document.body.innerHTML = ''
    document.body.appendChild(lds)
}

function close_ldg(){
    lds.hidden = 'none'
}

function confer_troco(){

}

function atualizaValores(total){
    const descontoInput = document.getElementById('in_desc');

    let desconto = parseFloat(descontoInput.value) || 0;

    // Limita o desconto ao valor do total original
    if (desconto > total) {
      desconto = total;
      descontoInput.value = total.toFixed(2);
      alert('Desconto não deve ser maior que o valor total!');
    }

    const debito = parseFloat(document.getElementById('pagPartialDeb').value) || 0;
    const credito = parseFloat(document.getElementById('pagPartialCred').value) || 0;
    const pix = parseFloat(document.getElementById('pagPartialPix').value) || 0;
    const dinheiro = parseFloat(document.getElementById('pagPartialDinheiro').value) || 0;

    const totalPago = debito + credito + pix + dinheiro;

    const totalFinal = Math.max(total - desconto, 0);
    const falta = totalFinal - totalPago;

    const faltaElem = document.getElementById('faltPag');
    const trocoElem = document.getElementById('trocoLbl');
    const btn = document.getElementById('setVenda');
    const ck = document.getElementById('pagPartial')

    if (falta > 0) {
        faltaElem.textContent = 'Falta pagar: ' + real(falta)
        trocoElem.textContent = 'Troco: 0.00';
        if(ck.checked){btn.disabled = true;}
    } else {
        faltaElem.textContent = 'Pago: ' + real(totalPago);
        trocoElem.textContent = 'Troco: ' + real(Math.abs(falta));
        if(ck.checked){btn.disabled = false;}
    }
}

function atualizar_desconto(t){
    const valor = document.getElementById('valor')
    const valorOriginal = valor.value
    const desconto = parseFloat(t.value || 0)
    const vl_pg = document.getElementById('vl_pg')

    if(valorOriginal && valorOriginal > 0){
        if(desconto > valorOriginal){
            toast("Desconto não deve ser maior que a venda!")
            t.value = valorOriginal
            vl_pg.textContent = 'Valor Pago: ' + real(0)
        }else{
            vl_pg.textContent = 'Valor a Pagar: ' + real(valorOriginal - desconto)
        }
    }else{t.value = 0}
}

// Troca de Frame e seta cor no Menu Button
function change_screen(screnn, t=null){
    others = parent.document.querySelectorAll('.menu-item')
    others.forEach(element => {element.style.background = null});
    if(t){t.style.background = green}
    
    const frame = parent.document.getElementById('frame_screen')
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

    try{
        return fetch(api + url, options)
    }catch{err => {
        toast("Erro interno - " + err)
    }}
}

// Função de Envio de Formulario
function send_form(url, form, method='post'){
    var options = {
        method: method,
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
async function cx(){
    res = await get_caixa()
    bd = document.getElementById('lbl_cx')
    if(res){
        bd.classList.remove('placeholder')
        bd.classList.add('text-bg-success')
        bd.textContent = `Aberto - ${res.fechamento.toLocaleString('pt-br', {style: 'currency', currency:'BRL'})}`
    }else{
        bd.classList.remove('placeholder')
        bd.classList.add('text-bg-danger')
        bd.textContent = 'Caixa Fechado'
    }
}

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
        st.textContent = `Caixa Aberto - R$${res['fechamento']}`
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

async function get_history_cx(){
    const res = await get_caixa()
    if(res){
        document.getElementById('cx_dinheiro').value = real(res['dinheiro'])
        document.getElementById('cx_debito').value = real(res['debito'])
        document.getElementById('cx_credito').value = real(res['credito'])
        document.getElementById('cx_pix').value = real(res['pix'])
        document.getElementById('cx_total').value = real(res['total'])
        document.getElementById('cx_abertura').value = real(res['abertura'])
        document.getElementById('cx_fechamento').value = real(res['fechamento'])
    }else{
        document.getElementById('cx_dinheiro').value = real(0)
        document.getElementById('cx_debito').value = real(0)
        document.getElementById('cx_credito').value = real(0)
        document.getElementById('cx_pix').value = real(0)
        document.getElementById('cx_total').value = real(0)
        document.getElementById('cx_abertura').value = real(0)
        document.getElementById('cx_fechamento').value = real(0)
    }
}

// Despesas =================================================================================
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

async function get_despesas(filter=null){
    req = await request('despesas')
    res = await req.json()

    if(res[0]){
        cont = 0
        res.forEach(item => {
            const id = item['id']
            const nome = item['motivo']
            const valor = item['valor']
            
            const data = new Date(item['data'])
            const dataAtual = new Date()
            const hora = data.toLocaleTimeString('pt-br', {hour: '2-digit', minute: '2-digit'})

            const dataStr = dataAtual.toLocaleDateString('pt-br', {month: 'numeric'})
            const dataStr2 = data.toLocaleDateString('pt-br', {month: 'numeric'})

            if(dataStr === dataStr2){
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

// Login =================================================================================
async function login(mat, pwd){
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

// Pedidos =================================================================================
async function get_pedidos(){
    req = await request('pedidos')
    res = await req.json()
    const tb_pedidos = document.getElementById('tb_pedidos')

    if(res[0]){
        res.forEach(item => {
            const cmd = item['cmd']
            const cli = item['cli']
            const func = item['func']

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
                        const id = item['id']
                        const idp = item['idp']
                        const prod = item['prod']
                        const quant = item['quant']
                        const st = item['status']

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
                        let btn = document.createElement('button')
                        btn.classList.add('btn')
                        btn.classList.add('btn-sm')
                        btn.classList.add('btn-danger')
                        btn.innerHTML = lixeira
                        btn.addEventListener('click', async function(){
                            if(confirm('Deseja realmente cancelar este produto?')){
                                dd = {id:id, cmd:cmd, idp:idp}
                                const req = await request('rm_order_only', 'DELETE', JSON.stringify(dd))
                                const res = await req.json()
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

// Produtos =================================================================================
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

//  Nova Comanda/Pedido =================================================================================
async function enviar_prods(t=null){
    const cmd = document.getElementById('cmdIn').value
    const cli = document.getElementById('cliIn').value
    const objs = document.querySelectorAll(".prods")
    const btnb = document.getElementById('btn_balcao')
    if(btnb.checked){data = {cmd: cmd, cliente: cmd}}
    else{data = {cmd: cmd, cliente:cli}}
    
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
            socket.emit("novo-pedido", data);
            req = await request("pedidos", "POST", JSON.stringify(data))
            res = await req.json()
            if(req.ok){change_screen('pedidos', parent.document.getElementById('menu_pedidos'))}
            else{
                t.textContent = 'Novo Pedido'
                toast(res)
            }
        }else{toast('Selecione algum produto!')}
    }else{toast('Comanda ou Mesa obrigatoria!')}

    
}

// Comandas =================================================================================
async function get_cmds(){
    req = await request('comandas')
    res = await req.json()
    const tb_cmds = document.getElementById('tb_comandas')

    if(Object.keys(res).length > 0){
        res.forEach(item => {
            const cliente = item['cliente']
            const cmd = item['cmd']
            const func = item['func']
            valor = item['valor']

            const tr = document.createElement('tr')

            const tdCmd = document.createElement('td')
            tdCmd.textContent = cmd
            tdCmd.classList.add('text-truncate')
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

            // Botão para adicionar na CMD
            const btnAddProdCmd = document.createElement('button')
            btnAddProdCmd.classList.add('btn')
            btnAddProdCmd.classList.add('btn-sm')
            btnAddProdCmd.classList.add('btn-warning')
            btnAddProdCmd.innerHTML = '<i class="bi bi-plus-circle-fill"></i>'
            divBtn.appendChild(btnAddProdCmd)
            btnAddProdCmd.addEventListener('click', async function(){
                location = `/gourmet/novoPedido.html?cmd=${cmd}&&cli=${cliente}`
            })

            // Btn Abrir
            const btnAbrirCmd = document.createElement('button')
            btnAbrirCmd.classList.add('btn')
            btnAbrirCmd.classList.add('btn-sm')
            btnAbrirCmd.classList.add('btn-success')
            btnAbrirCmd.innerHTML = '<i class="bi bi-box-arrow-up-right"></i>'
            divBtn.appendChild(btnAbrirCmd)
            btnAbrirCmd.addEventListener('click', async function(){
                location = `/gourmet/cmd.html?cmd=${cmd}`
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
        const cmd = res['cmd']
        const cli = res['cli']
        const func = res['func']
        const data = new Date(res['data'])
        let total = res['total']
        const prods = res['prods']

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
            const prod = item['nome']
            const nome = item['func']
            let valor = item['valor']
            const quant = item['quant']
            const hora = item['hora']
            const st = item['status']
            const idPedido = item['id_pedido']

            li = document.createElement('li')
            li.classList.add('list-group-item')

            const dvM = document.createElement('div')
            dvM.classList.add('d-flex')
            dvM.classList.add('flex-row')
            dvM.classList.add('justify-content-between')
            dvM.classList.add('aling-items-center')

            const dv = document.createElement('div')
            dv.classList.add('d-flex')
            dv.classList.add('flex-column')
            dv.classList.add('gap-1')

            const sp = document.createElement('span')
            sp.textContent = `${quant} ${prod} - ${real(valor)} - `
            sp.style.fontSize = '14px'

            const sp2 = document.createElement('span')
            sp2.innerHTML = `
                <i class="bi bi-person"></i> ${nome}<br>
                <i class="bi bi-clock"></i> ${hora}
                `
            sp2.style.fontSize = '12px'

            const sp3 = document.createElement('span')
            sp3.classList.add('badge')
            sp3.classList.add('rounded-pill')
            if(st === 'ENTREGUE'){sp3.classList.add('text-bg-success')}
            else if(st === 'SOLICITADO'){sp3.classList.add('text-bg-info')}
            else if(st === 'CANCELADO'){sp3.classList.add('text-bg-danger')}
            sp3.innerHTML = `<i class="bi bi-clipboard2-check-fill"></i> ${st}`
            sp.appendChild(sp3)

            dv.appendChild(sp)
            dv.appendChild(sp2)
            dvM.appendChild(dv)
            
            const dv2 = document.createElement('div')
            dv2.classList.add('btn-group')

            const btnCancelar = document.createElement('button')
            btnCancelar.classList.add('btn','btn-danger')
            btnCancelar.innerHTML = lixeira
            btnCancelar.addEventListener('click', async function(){
                if(confirm('Deseja cancelar este pedido?')){
                    const req = await request('pedido', 'DELETE', JSON.stringify({id: idPedido, cmd: cmd}))
                    const res = await req.json()
                    if(req.ok){location.reload()}
                    else{toast(res)}
                }
            })
            
            dv2.appendChild(btnCancelar)
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

        const ck = document.getElementById('pagPartial')
        ck.onchange = function(){
            document.getElementById('setVenda').disabled = true
            const t = document.getElementById('div_pag')
            const t2 = document.getElementById('div_pag_partial')

            if(ck.checked){
                t.hidden = 'none'
                t2.hidden = ''
            }else{

                t.hidden = ''
                t2.hidden = 'none'
            }
        }

        document.getElementById('pagPartialDeb').oninput = function(){atualizaValores(total)}
        document.getElementById('pagPartialCred').oninput = function(){atualizaValores(total)}
        document.getElementById('pagPartialPix').oninput = function(){atualizaValores(total)}
        document.getElementById('pagPartialDinheiro').oninput = function(){atualizaValores(total)}
        document.getElementById('in_desc').oninput = function(){atualizaValores(total)}
        

        document.getElementById('setVenda').addEventListener('click', async function(e){
            e.preventDefault()

            const debito = parseFloat(document.getElementById('pagPartialDeb').value) || 0;
            const credito = parseFloat(document.getElementById('pagPartialCred').value) || 0;
            const pix = parseFloat(document.getElementById('pagPartialPix').value) || 0;
            const dinheiro = parseFloat(document.getElementById('pagPartialDinheiro').value) || 0;

            let valor_pago = 0;
            let troco = 0;

            if(ck.checked){
                valor_pago = document.getElementById('faltPag').textContent.replace('Pago: R$ ', '').replace(',','.') || 0;
                troco = document.getElementById('trocoLbl').textContent.replace('Troco: R$ ', '').replace(',','.') || 0;
            }else{
                valor_pago = total
            }

            dd = {
                'cmd': cmd,
                'valor': parseFloat(valor_pago),
                'desconto': parseFloat(in_desc.value),
                'debito': debito,
                'credito': credito,
                'pix': pix,
                'dinheiro': dinheiro,
                'cliente': cli,
                'troco': troco
            }

            if(!ck.checked){
                dd[document.getElementById('in_pag').value] = total
            }

            const req = await request('comandas', 'POST', JSON.stringify(dd))
            const res = await req.json()

            if(req.ok){change_screen('comandas', parent.document.getElementById('menu_comandas'))}
            else{toast(res, 'erro')}
        })

    }else{toast(res, 'erro'); change_screen('comandas')}
}

// Vendas =================================================================================
async function get_vendas(){
    const req = await request('vendas')
    const res = await req.json()
    if(req.ok){
        const tableData = []
        res.forEach(item => {
            const datt = new Date(item['data']).toLocaleDateString('pt-br', {month: 'numeric'})
            const datA = new Date().toLocaleDateString('pt-br', {month: 'numeric'})
            if(datt === datA){
                tableData.push({
                    cmd: item['cmd'],
                    func: item['funcionario'],
                    data: new Date(item['data']).toLocaleDateString('pt-br', {day:'numeric', month:'long', hour:'numeric', minute:'numeric'}),
                    valor: real(item['valor_real']),
                    cliente: item['cliente'],
                    btn: `
                    <div class="btn-group">
                        <button class="btn btn-sm btn-danger" onclick="excluir_venda(${item['id']})">${lixeira}</button>
                    </div>`
                })
            }
        })
        new Tabulator("#tb_vendas", {
            data: tableData,
            layout: "fitColumns",
            responsiveLayout: true,
            paginationSize: 10,
            paginationCounter:"rows",
            pagination:"local",
            columns: [
                {title: "Comanda", field: "cmd", responsive: 0, minWidth: 100},
                {title: "Funcionario", field: "func", responsive: 6, minWidth: 100},
                {title:"Data da venda", field:"data", hozAlign:"center", responsive: 0, minWidth: 100},
                {title:"Valor", field:"valor", hozAlign:"center", responsive: 0, minWidth: 100},   
                {title:"Cliente", field:"cliente", responsive: 4, minWidth: 100},
                {title:"Ações", field:"btn", hozAlign:"center", responsive: 0, minWidth: 100, formatter:"html"}
            ]
        });
    }
}

async function create_modal_vendas(){
    const req = await request('produtos')
    const res = await req.json()
    const tbProds = document.getElementById('prods_nova_venda')
    const carrinho = document.getElementById('carrinho')
    const valorIn = document.getElementById('valor')
    const vl_pg = document.getElementById('vl_pg')
    const descIn = document.getElementById('desconto')
    let valor = 0;
    let cont = 0

    if(req.ok){
        if(res[0]){
            tbProds.innerHTML = ''
            res.forEach(item => {
                const nome = item.nome
                const id = item.id
                const valorItem = item.valor
                const quant = item.quantidade

                const tr = document.createElement('tr')

                const tdProd = document.createElement('td')
                tdProd.textContent = nome
                tr.appendChild(tdProd)

                if(quant > 0){
                    const tdBtn = document.createElement('td')

                    const buttonAdd = document.createElement('button')
                    buttonAdd.classList.add('btn', 'btn-sm', 'btn-success', 'fw-bold', 'fs-5')
                    buttonAdd.innerHTML = '<i class="bi bi-plus"></i>'
                    buttonAdd.addEventListener('click', function(){
                        if(cont == 0){carrinho.innerHTML = ''}

                        const li = document.createElement('li')                        
                        li.classList.add('list-group-item', 'd-flex', 'justify-content-between')
                        
                        const span = document.createElement('span')
                        span.textContent = nome
                        
                        const btnRm = document.createElement('button')
                        btnRm.classList.add('btn', 'btn-sm', 'btn-danger')
                        btnRm.innerHTML = lixeira
                        btnRm.addEventListener('click', function(){
                            carrinho.removeChild(li)
                            valor -= valorItem
                            valorIn.value = valor
                            cart[id].quantidade -= 1
                            cart[id].valor -= valorItem
                            if(cart[id].quantidade == 0){delete cart[id]}
                            vl_pg.textContent = 'Valor a Pagar: ' + real(valorIn.value)
                            atualizar_desconto(descIn)
                        })
                        
                        li.appendChild(span)
                        li.appendChild(btnRm)
                        
                        carrinho.appendChild(li)

                        valor += valorItem
                        valorIn.value = valor

                        vl_pg.textContent = 'Valor a Pagar: ' + real(valorIn.value)
                        atualizar_desconto(descIn)

                        if(cart[id]){
                            cart[id].quantidade += 1
                            cart[id].valor += valorItem
                        }else{
                            cart[id] = {
                                nome: nome,
                                valor: valorItem,
                                quantidade: 1
                            }
                        }

                        cont += 1
                    })

                    tdBtn.appendChild(buttonAdd)
                    tr.appendChild(tdBtn)
                }else{
                    const tdSp = document.createElement('td')
                    const spanEstoque = document.createElement('span')
                    spanEstoque.classList.add('badge', 'text-bg-danger')
                    spanEstoque.textContent = 'Sem estoque!'
                    tdSp.appendChild(spanEstoque)
                    tr.appendChild(tdSp)
                }
                tbProds.appendChild(tr)
            })
        }else{
            const tr = document.createElement("tr")

            const td = document.createElement('td')
            td.textContent = "Nenhum produto adicionado ainda! Cadastre seu estoque"
            td.classList.add("text-center", "p-2", "d-flex", "align-items-center", "justify-content-center")
            
            const tdAction = document.createElement('td')
            const btn = document.createElement('button')
            btn.classList.add("btn", "btn-success")
            btn.textContent = " + "
            btn.addEventListener('click', function(){
                change_screen('estoque')
            })
            tdAction.appendChild(btn)
            
            tr.appendChild(td)
            tr.appendChild(tdAction)
            tbProds.appendChild(tr)
        }
    }

    modal = get_modal('modal_nova_venda')
    modal.show()


}

async function vender(t){
    const valor = document.getElementById('valor')
    const desconto = document.getElementById('desconto')
    const mt_pg = document.getElementById('mt_pg')

    if(valor.value > 0){
        t.innerHTML = spinner
        dd = {
            valor: parseFloat(valor.value),
            desconto: parseFloat(desconto.value, 0),
            mt_pg: mt_pg.value,
            cart: cart,
        }
        const req = await request('vendas', 'POST', JSON.stringify(dd))
        const res = await req.json()
    
        if(req.ok){location.reload()}
        else{toast(res, 'erro'); t.textContent = 'Vender'}
    }else{toast("Valor Obrigatório", 'erro')}

}

// Estoque =================================================================================
async function get_estoque(){
    const req = await request("produtos")
    const res = await req.json()
    const list_prods = document.getElementById('list_prods')

    if(req.ok){
        if(res[0]){
            res.forEach(item => {
                const img = item.img
                const id = item.id
                const sku = item.sku
                const nome = item.nome
                const categoria = item.categoria
                const id_ctg = item.id_ctg
                const custo = item.custo
                const valor = item.valor
                const quantidade = item.quantidade
                const alerta = item.alerta
                const data = new Date(item.data)

                const tr = document.createElement('tr')

                const tdImg = document.createElement('td')
                tdImg.classList.add('d-flex', 'justify-content-center')
                const link = document.createElement('a')
                const imgIn = document.createElement('img')
                imgIn.classList.add('img-fluid', 'img-thumbnail')
                if(img == 'blank.png'){
                    imgIn.src = server + 'img/' + img
                    link.href = server + 'img/' + img
                }else{
                    imgIn.src = server + 'img/gourmet/' + img
                    link.href = server + 'img/gourmet/' + img
                }
                link.target = '_blank'
                imgIn.style.height = '35px'
                link.appendChild(imgIn)
                tdImg.appendChild(link)

                const tdId = document.createElement('td')
                tdId.classList.add('text-truncate')
                const spId = document.createElement('span')
                spId.classList.add('badge', 'text-bg-info')
                spId.textContent = id
                tdId.appendChild(spId)

                const tdSku = document.createElement('td')
                tdSku.classList.add('text-truncate')
                tdSku.textContent = sku

                const tdNome = document.createElement('td')
                tdNome.classList.add('text-truncate', 'fw-bold')
                tdNome.textContent = nome

                const tdCtg = document.createElement('td')
                tdCtg.classList.add('text-truncate')
                tdCtg.textContent = categoria

                const tdCt = document.createElement('td')
                tdCt.classList.add('text-truncate')
                tdCt.textContent = real(custo)

                const tdVl = document.createElement('td')
                tdVl.classList.add('text-truncate')
                tdVl.textContent = real(valor)

                const tdLc = document.createElement('td')
                tdLc.classList.add('text-truncate')
                const spLucro = document.createElement('span')
                spLucro.classList.add('badge')
                lucro = parseFloat(((valor - custo) / custo) * 100)

                if(lucro >= 100){
                    spLucro.textContent = "+99%"
                    spLucro.classList.add('text-bg-success')
                }else if(lucro >= 70 && lucro < 100){
                    spLucro.classList.add('text-bg-primary')
                    spLucro.textContent = `${lucro.toFixed(1)}%`
                }else if(lucro >= 50 && lucro < 70){
                    spLucro.classList.add('text-bg-warning')
                    spLucro.textContent = `${lucro.toFixed(1)}%`
                }else if(lucro >= 20 && lucro < 50){
                    spLucro.classList.add('text-bg-danger')
                    spLucro.textContent = `${lucro.toFixed(1)}%`
                }

                tdLc.appendChild(spLucro)
                
                const tdQuant = document.createElement('td')
                tdQuant.classList.add('text-truncate', 'text-center')
                const spQt = document.createElement('span')
                spQt.classList.add('fw-bold', 'fs-6')
                if(quantidade <= alerta){spQt.classList.add('text-danger')}
                else if(quantidade - 3 <= alerta){spQt.classList.add('text-warning')}
                else{spQt.classList.add('text-success')}
                spQt.textContent = quantidade
                tdQuant.appendChild(spQt)

                const tdAlerta = document.createElement('td')
                tdAlerta.classList.add('text-truncate')
                tdAlerta.textContent = alerta

                const tdCad = document.createElement('td')
                tdCad.classList.add('text-truncate')
                tdCad.textContent = data.toLocaleDateString('pt-br', {hour: '2-digit', minute: '2-digit'})

                const tdBtn = document.createElement('td')
                const btnGroup = document.createElement('div')
                btnGroup.classList.add('btn-group')

                const btnEditar = document.createElement('button')
                btnEditar.classList.add('btn', 'btn-light', 'btn-sm')
                btnEditar.innerHTML = icon_edit
                btnEditar.addEventListener('click', function(){
                    const form = document.getElementById('edit_prod')
                    if(img == 'blank.png'){form.previewEditProd.src = server + 'img/blank.png'}
                    else{form.previewEditProd.src = server + 'img/gourmet/' + img}
                    form.idprod.value = id
                    form.nome.value = nome
                    form.sku.value = sku
                    form.categoria.value = id_ctg
                    form.custo.value = custo
                    form.valor.value = valor
                    ed_calc_lucro()
                    form.quantidade.value = quantidade
                    form.alerta.value = alerta

                    get_modal('md_editProd').show()
                })

                const btnRemover = document.createElement('button')
                btnRemover.classList.add('btn', 'btn-danger', 'btn-sm')
                btnRemover.innerHTML = lixeira
                btnRemover.addEventListener('click', async function(){
                    if(confirm('Deseja excluir este item permanentemente?')){
                        const req = await request('produtos', 'DELETE', JSON.stringify({id:id}))
                        const res = await req.json()

                        if(req.ok){location.reload()}
                        else{toast(res, 'erro')}
                    }
                })

                btnGroup.appendChild(btnEditar)
                btnGroup.appendChild(btnRemover)
                tdBtn.appendChild(btnGroup)

                
                tr.appendChild(tdId)
                tr.appendChild(tdImg)
                tr.appendChild(tdSku)
                tr.appendChild(tdNome)
                tr.appendChild(tdCtg)
                tr.appendChild(tdCt)
                tr.appendChild(tdVl)
                tr.appendChild(tdLc)
                tr.appendChild(tdQuant)
                tr.appendChild(tdAlerta)
                tr.appendChild(tdCad)
                tr.appendChild(tdBtn)

                list_prods.appendChild(tr)
            })
        }
    }
}

// Função de Adicionar Produtos
const formD = document.getElementById('new_prod')
if(formD){ 
    formD.addEventListener('submit', async function(e){
        e.preventDefault()

        const form = new FormData(this)
        const req = await send_form('produtos', form)
        const res = await req.json()

        if(req.ok){location.reload()}
        else{toast(res, 'erro')}
    })
}

// Função de Editar Produto
const formE = document.getElementById('edit_prod')
if(formE){ 
    formE.addEventListener('submit', async function(e){
        e.preventDefault()
        const btn = document.getElementById('btnEditProd')
        btn.innerHTML = spinner
        const form = new FormData(this)
        const req = await send_form('produtos', form, 'PATCH')
        const res = await req.json()

        if(req.ok){location.reload()}
        else{toast(res, 'erro'); btn.textContent = 'Editar Produto'}
    })
}

// Categorias =================================================================================
async function get_categorias(){
    const req = await request('categorias')
    const res = await req.json()
    const list_ctgs = document.getElementById('list_ctg')

    if(req.ok){
        if(res[0]){
            res.forEach(item => {
                const id = item.id
                const nome = item.nome

                const li = document.createElement('li')
                li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center')

                const sp = document.createElement('span')
                sp.textContent = nome

                const btnRemover = document.createElement('button')
                btnRemover.classList.add('btn', 'btn-danger', 'btn-sm')
                btnRemover.innerHTML = lixeira
                btnRemover.addEventListener('click', async function(){
                    if(confirm("Deseja realmente excluir esta categoria?")){
                        const req = await request("categorias", "DELETE", JSON.stringify({id:id}))
                        const res = await req.json()
                        if(req.ok){location.reload()}
                        else{toast(res)}
                    }
                })
                li.appendChild(sp)
                li.appendChild(btnRemover)
                list_ctgs.appendChild(li)
            })
        }
    }
}

async function get_categorias_opt(){
    const req = await request('categorias')
    const res = await req.json()
    const form = document.getElementById('new_prod')
    const selCtg = form.categoria
    
    const formEdit = document.getElementById('edit_prod')
    const selEdCtg = formEdit.categoria


    if(req.ok){
        if(res[0]){
            res.forEach(item => {
                const id = item.id
                const nome = item.nome

                const opt = document.createElement('option')
                opt.value = id
                opt.textContent = nome
                selCtg.appendChild(opt)

                const opt2 = document.createElement('option')
                opt2.value = id
                opt2.textContent = nome
                selEdCtg.appendChild(opt2)
            })
        }
    }
}

async function add_categoria(nome){
    if(nome){
        const req = await request("categorias","POST", JSON.stringify({nome:nome.toUpperCase()}))
        const res = await req.json()
    
        if(req.ok){location.reload()}
        else{toast(res, 'erro')}
    }else{toast("Nome Invalido", "erro")}
}


// Combos =================================================================================
async function get_combos() {
    const req = await request('combos')
    const res = await req.json()
    const list_combos = document.getElementById('list_combos')
    
    if(req.ok){
        if(res[0]){
            res.forEach(item => {
                console.log(item)
                const img = item.img
                const nome = item.nome
                const valor = item.valor
                const id = item.id
                const ativo = item.ativo
                const items = item.items
                
                const tr = document.createElement('tr')

                const tdImg = document.createElement('td')
                tdImg.classList.add('d-flex','justify-content-center')
                const a = document.createElement('a')
                a.target = '_blank'
                const imgS = document.createElement('img')
                imgS.classList.add('img-fluid', 'img-thumbnail')
                imgS.style.width = '30px'
                imgS.style.height = '30px'
                if(img == 'blank.png'){
                    link = server + 'img/blank.png'
                    imgS.src = link
                    a.href = link
                }
                else{
                    link = server + '/img/gourmet/' + img
                    imgS.src = link
                    a.href = link
                }
                a.appendChild(imgS)
                tdImg.appendChild(a)

                const tdId = document.createElement('td')
                tdId.textContent = id

                const tdNome = document.createElement('td')
                tdNome.textContent = nome

                const tdValor = document.createElement('td')
                tdValor.innerHTML = real(valor)

                const tdAtivo = document.createElement('td')
                tdAtivo.textContent = ativo

                const tdItems = document.createElement('td')
                tdItems.textContent = items

                const tdBtn = document.createElement('td')
                const btnGroup = document.createElement('div')
                btnGroup.classList.add('btn-group')

                const btnRemover = document.createElement('button')
                btnRemover.classList.add('btn', 'btn-danger', 'btn-sm')
                btnRemover.innerHTML = lixeira
                btnRemover.addEventListener('click', function(){

                })

                const btnEditar = document.createElement('button')
                btnEditar.classList.add('btn', 'btn-sm', 'btn-secondary')
                btnEditar.innerHTML = icon_edit
                btnEditar.addEventListener('click', function(){

                })

                tdBtn.appendChild(btnEditar)
                tdBtn.appendChild(btnRemover)


                tr.appendChild(tdImg)
                tr.appendChild(tdId)
                tr.appendChild(tdNome)
                tr.appendChild(tdValor)
                tr.appendChild(tdAtivo)
                tr.appendChild(tdItems)
                tr.appendChild(tdBtn)
                list_combos.appendChild(tr)




            })
        }
    }else{toast(res, 'erro')}
    
}

// Controle de Permissao =================================================================================
const perm = sessionStorage.getItem('permissao')
if(perm){
    if(perm === 'FUNC' || perm === 'GRC'){
        parent.document.getElementById('link_caixa').hidden = 'none'
        parent.document.getElementById('link_relatorios').hidden = 'none'
        parent.document.getElementById('link_config').hidden = 'none'
        
        mb_caixa = parent.document.getElementById('mobile_caixa')
        mb_caixa.classList.remove('d-flex')
        mb_caixa.style.display = 'none'
        parent.document.getElementById('mobile_relatorios').hidden = 'none'
        parent.document.getElementById('mobile_config').hidden = 'none'
    }
}
if(window.location.pathname !== '/' && !mat){window.location = '/'}
if(nome){try{document.getElementById('lbl_nome_usuario').textContent = nome}catch{}}

// Masks =================================================================================


// JQuery --------------------------------------------------------------------------------------------------------------
$(document).ready(function(){
    $(".tel-mask").inputmask("(99) 99999-9999");
});

$(document).ready(function(){
    $(".money-mask").inputmask("currency");
});

// Eventos =================================================================================
const btn = document.getElementById('btnNovaVenda')
if(btn){
    btn.addEventListener('click', function(){
        create_modal('modal_nova_venda', 'Nova Venda', 'Hi','center').show()
    })
}

const form = document.getElementById("form_login")
if(form){
    form.addEventListener('submit', function(e){
        e.preventDefault()

        login(this.mat.value, this.pwd.value)
    })
}