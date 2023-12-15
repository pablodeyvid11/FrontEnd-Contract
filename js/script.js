// ENDEREÇO EHTEREUM DO CONTRATO
var contractAddress = "0xBe64E0Aa4de4e8244A2DF74b6C773AA3f6C715c2";

// Inicializa o objeto DApp
document.addEventListener("DOMContentLoaded", onDocumentLoad);
function onDocumentLoad() {
    DApp.init();
}

window.anuncios = [];


setInterval(() => {
    atualizaInterface();
}, 10000);

// Nosso objeto DApp que irá armazenar a instância web3
const DApp = {
    web3: null,
    contracts: {},
    account: null,

    init: function () {
        return DApp.initWeb3();
    },

    // Inicializa o provedor web3
    initWeb3: async function () {
        if (typeof window.ethereum !== "undefined") {
            try {
                const accounts = await window.ethereum.request({ // Requisita primeiro acesso ao Metamask
                    method: "eth_requestAccounts",
                });
                DApp.account = accounts[0];
                window.ethereum.on('accountsChanged', DApp.updateAccount); // Atualiza se o usuário trocar de conta no Metamaslk
            } catch (error) {
                console.error("Usuário negou acesso ao web3!");
                return;
            }
            DApp.web3 = new Web3(window.ethereum);
        } else {
            console.error("Instalar MetaMask!");
            return;
        }
        return DApp.initContract();
    },

    // Atualiza 'DApp.account' para a conta ativa no Metamask
    updateAccount: async function () {
        DApp.account = (await DApp.web3.eth.getAccounts())[0];
        atualizaInterface();
    },

    // Associa ao endereço do seu contrato
    initContract: async function () {
        DApp.contracts.AnonymousRegistryOffice = new DApp.web3.eth.Contract(Abi, contractAddress);
        return DApp.render();
    },

    // Inicializa a interface HTML com os dados obtidos
    render: async function () {
        inicializaInterface();
    }
};

async function obterTodosOsAnuncios() {
    try {
        const anuncios = await DApp.contracts.AnonymousRegistryOffice.methods.obterTodosOsAnuncios().call();
        return anuncios;
    } catch (error) {
        console.error('Erro ao obter anúncios:', error);
        return [];
    }
}

async function anunciarNFT() {
    let addressAnuncio = document.getElementById("addressAnuncio").value
    let tokenId = document.getElementById("tokenAnuncio").value
    let valorAnuncio = document.getElementById("valorAnuncio").value
    let descricaoAnuncio = document.getElementById("descricaoAnuncio").value
    if(addressAnuncio == '' || tokenId == '' || valorAnuncio == '' || descricaoAnuncio == '') {
        console.error("Need more information")
        return;
    }
    try {
        await DApp.contracts.AnonymousRegistryOffice.methods.anunciarNFT(addressAnuncio, tokenId, valorAnuncio, descricaoAnuncio)
            .send({ from: DApp.account });
        console.log('NFT anunciado com sucesso!');
        atualizaInterface();
    } catch (error) {
        console.error('Erro ao anunciar NFT:', error);
    }
}

async function comprarNFT(tokenId) {

    if(tokenId == '') {
        console.error("Need more information")
        return;
    }

    let anuncio = null;
    window.anuncios.forEach(element => {
        if (element.tokenId == tokenId) {
            anuncio = element;
        }
    });

    if (anuncio == null) return;

    try {
        const transaction = await DApp.contracts.AnonymousRegistryOffice.methods.comprarNFT(tokenId)
            .send({ from: DApp.account, value: etherToWei(anuncio[3]) }); // Adicione o valor aqui
        console.log('NFT comprado com sucesso!', transaction);
        atualizaInterface()
    } catch (error) {
        console.error('Erro ao comprar NFT:', error);
    }
}

function etherToWei(etherValue) {
    const ether = 10 ** 18; // 1 ether = 10^18 wei
    return BigInt(etherValue * ether).toString();
  }

function inicializaInterface() {
    atualizaInterface();
}

function atualizaInterface() {
    document.getElementById("anuncios").innerHTML = '';
    let anuncios = '';

    obterTodosOsAnuncios().then(anunciosObj => {
        anunciosObj.forEach(element => {
            anuncios += `
            <tr>
                <td>${element[2]}</td>
                <td>${element[1]}</td>
                <td>${element[3]}</td>
                <td>${element[4]}</td>
                <td><button onclick="comprarNFT(${element[1]})" style="background: transparent;color: white;border-color: white;cursor: pointer;border-radius: 10px;">Comprar</button</td>
            </tr>
        `;
            window.anuncios.push(element);
        });
        if(window.anuncios.length == 0) {
            document.getElementById("containerNenhumAnuncio").style.display = "inherit";
            document.getElementById("containerAnuncios").style.display = "none";
        } else {
            document.getElementById("containerNenhumAnuncio").style.display = "none";
            document.getElementById("containerAnuncios").style.display = "inherit";
            document.getElementById("anuncios").innerHTML = anuncios;
        }
    })
}
