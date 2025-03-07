let player = '';

let userData =
{
    username: '',
    password: ''
};

let AI = {
    y: null,
    x: null,
    yObecne: null,
    xObecne: null,
    pion: null,
    zmiennik: null,
    sciana: 0,
    trafienia: []
};


const matSize = 12;

let matLeft = Array(matSize).fill().map(() => Array(matSize).fill().map(() => ({
    isBlocked: false,
    haveShip: false,
    hasBeenShoot: false
})));

let matRight = Array(matSize).fill().map(() => Array(matSize).fill().map(() => ({
    isBlocked: false,
    haveShip: false,
    hasBeenShoot: false
})));

const tabShips = [3,2,1,1,0];
let wskaznik = 0;
let elId = '';

let dlug = 0;
let kierunek = 0;
let czyMoznaPostawic = false;
let turaGracza = true;

let okretyNasze;
let okretyWroga;

//0 - prawo
//1 - dół
//2 - lewo
//3 - góra

//321
//co musi zachować pole?
//1 to czy jest zablokowane - ramka i pola na około statków
//2 czy ma statek
//3 czy zostało ostrzelane


//tworzenie zablokowanej opbramówki na dwuch szachownicach
for(let i = 0; i < 12; i++)
    for (let j = 0; j  < 12; j++) {
        if(i == 0 || i == 11 || j == 0 || j == 11)
        {
            matLeft[i][j].isBlocked = true;
            matLeft[i][j].hasBeenShoot = true;
            matRight[i][j].isBlocked = true;
            matRight[i][j].hasBeenShoot = true;
        }
    }

window.onload = function()
{
    renderSzach("#szachwnicaLewa");
    renderSzach("#szachwnicaPrawa");
    mainMenu();
}

function mainMenu()
{
    let html = "";
    html += `<button type="button" id="guestPlay" class="crttxt">Graj jako gość</button>`;
    html += `<button type="button" id="login" class="crttxt">Zaloguj się</button>`;
    html += `<button type="button" id="registry" class="crttxt">Zarejestruj się</button>`;

    document.querySelector("#interfejsPrawa").innerHTML = html;

    document.querySelector("#guestPlay").addEventListener('click', startGameGuest);
    document.querySelector("#login").addEventListener('click', login);
    document.querySelector("#registry").addEventListener('click', rejestr);
}

function renderSzach(nazwa)
{
    let znak = "";
    if(nazwa == "#szachwnicaLewa")
        znak = "SzL";
    else
        znak = "SzP";

    let html = "";
    let color = 0;
    for(let i = 0; i < 12; i++)
        for (let j = 0; j  < 12; j++) {
            if(i == 0 || i == 11 || j == 0 || j == 11)
                color = (i + j) % 2 === 0 ? '#A0A' : '#222';
            else
            color = (i + j) % 2 === 0 ? '#00A' : '#CCC';
            html += `<div id = "${znak}${i.toString(16)}-${j.toString(16)}"`;
            
            if((i == 0 || j == 0) && (j != i && i != 11 && j != 11))
                if (i == 0)
                    html += `>${j}`;
                else
                    html += `>${String.fromCharCode(64 + i)}`;
            else 
                if(i != 0 && j != 0 && i != 11 && j != 11)
                    html += `class = "tileEkran">`;
                else 
                    html += ">"
                
            html += `</div>`;
        }

    const szachownica = document.querySelector(nazwa);
    szachownica.style.display = 'grid';
    szachownica.style.gridTemplateColumns = 'repeat(12, 1fr)';
    szachownica.style.gap = '0';

    document.querySelector(nazwa).innerHTML = html;

    for(let i = 1; i < 11; i++)
        for (let j = 1; j  < 11; j++)
        {
            document.querySelector(`#${znak}${i.toString(16)}-${j.toString(16)}`).addEventListener('mouseover',podswietlCor);
            document.querySelector(`#${znak}${i.toString(16)}-${j.toString(16)}`).addEventListener('mouseout',zgasCol);
        }
}

function podswietlCor()
{
    const kolor = "#9be39d";
    document.querySelector(`#${this.id.slice(0,3)}${this.id[3]}-0`).style.color = kolor;
    document.querySelector(`#${this.id.slice(0,3)}0-${this.id[5]}`).style.color = kolor;
}

function zgasCol()
{
    const kolor = "black";
    document.querySelector(`#${this.id.slice(0,3)}${this.id[3]}-0`).style.color = kolor;
    document.querySelector(`#${this.id.slice(0,3)}0-${this.id[5]}`).style.color = kolor;
}

function login()
{
    let html = "";
    html += `<form id="rejestracjaForm">`;
    html +=     `<label for="username">Nazwa Użytkownika</label>`;
    html +=     `<input type="text" id="username" class="crttxt">`;
    html +=     `<label for="password">Hasło</label>`;
    html +=     `<input type="password" id="password" class="crttxt">`;
    html +=     `<button type="submit" id="rejestracja" class="crttxt">Zaloguj Się</button>`;
    html +=     `<button type="button" id="powrotMenu" class="crttxt">Anuluj</button>`;
    html += `</form>`;

    document.querySelector("#interfejsPrawa").innerHTML = html;

    document.querySelector("#powrotMenu").addEventListener('click', mainMenu);

    document.querySelector("#rejestracjaForm").addEventListener("submit", async function (event)
    {
        event.preventDefault();

        userData =
        {
            username: document.querySelector("#username").value,
            password: document.querySelector("#password").value
        };
 
        const dataToSend = new FormData();
        dataToSend.append('json', JSON.stringify(userData))

        try
        {
            let response = await fetch('api/logowanie.php', {
                method: 'POST',
                mode: 'cors',
                body: dataToSend
            });
    
            let result = await response.json();

            if (response.ok)
                if(result.message !== 'error')
                {
                    console.log(result.message);
                    player = userData.username;
                    menuPoZalogowaniu()
                    //startGame();
                }
                else
                {
                    alert(result.error)
                }

        }
        catch(err)
        {
            alert(err);
        }
    });
}

function rejestr()
{
    //console.log("działa");

    let html = "";
    html += `<form id="rejestracjaForm">`;
    html +=     `<label for="username">Nazwa Użytkownika</label>`;
    html +=     `<input type="text" id="username" class="crttxt">`;
    html +=     `<label for="password">Hasło</label>`;
    html +=     `<input type="password" id="password" class="crttxt">`;
    html +=     `<button type="submit" id="rejestracja" class="crttxt">Zarejestruj Się</button>`;
    html +=     `<button type="button" id="powrotMenu" class="crttxt">Anuluj</button>`;
    html += `</form>`;

    document.querySelector("#interfejsPrawa").innerHTML = html;

    document.querySelector("#powrotMenu").addEventListener('click', mainMenu);

    document.querySelector("#rejestracjaForm").addEventListener("submit", async function (event)
    {
        event.preventDefault();

        userData =
        {
            username: document.querySelector("#username").value,
            password: document.querySelector("#password").value
        };
 
        const dataToSend = new FormData();
        dataToSend.append('json', JSON.stringify(userData))

        try
        {
            let response = await fetch('api/rejestracja.php', {
                method: 'POST',
                mode: 'cors',
                body: dataToSend
            });
    
            let result = await response.json();

            if (response.ok)
                if(result.message !== 'error')
                {
                    console.log(result.message);
                    player = userData.username;
                    menuPoZalogowaniu()
                    //startGame();
                }
                else
                {
                    alert(result.error)
                }

        }
        catch(err)
        {
            alert(err);
        }
    });
}

function menuPoZalogowaniu()
{
    let displayName = 'John Doe';

    if(!player == '')
        displayName = player;

    let html = '';

    html += '<div id="ustTxtGora">';
    html += `<h3>Witaj ${displayName}</h3> <br>`;
    html += '</div>';
    html += '<button id="rozpocznijGre" class="crttxt">Start</button>'
    html += '<button id="Statistic" class="crttxt">Statystyki</button>'

    document.querySelector("#interfejsPrawa").innerHTML = html;

    document.querySelector("#ustTxtGora").style.width = '90%';
    document.querySelector("#ustTxtGora").style.height = '10%';
    document.querySelector("#ustTxtGora").style.margin = '5%';
    document.querySelector("#ustTxtGora").style.marginTop = '15%';
    document.querySelector("#ustTxtGora").style.fontSize = '2.5vh';
    document.querySelector("#ustTxtGora").style.textAlign = 'center';

    document.querySelector("#rozpocznijGre").style.width = '80%';
    document.querySelector("#rozpocznijGre").style.marginLeft = '10%';
    document.querySelector("#rozpocznijGre").style.marginBottom = '10%';
    document.querySelector("#rozpocznijGre").style.height = '20%';

    document.querySelector("#Statistic").style.width = '80%';
    document.querySelector("#Statistic").style.marginLeft = '10%';
    document.querySelector("#Statistic").style.height = '20%';

    document.querySelector("#rozpocznijGre").addEventListener('click', startGame);

    document.querySelector("#Statistic").addEventListener('click', async function (event)
    {
        event.preventDefault();
 
        const dataToSend = new FormData();
        dataToSend.append('json', JSON.stringify(userData))

        try
        {
            let response = await fetch('api/showStats.php', {
                method: 'POST',
                mode: 'cors',
                body: dataToSend
            });
    
            let result = await response.json();

            if (response.ok)
                if(result.message !== 'error')
                {
                    console.log(result.message);
                    showStats(result.message);
                }
                else
                {
                    alert(result.error)
                }

        }
        catch(err)
        {
            alert(err);
        }
    });
}

function showStats(dane)
{
    let html = '';

    html += '<div id="ustTxtGora">';
    html += `<h3>Statystyki gracza ${player}</h3> <br>`;
    html += '</div>';

    document.querySelector("#interfejsPrawa").innerHTML = html;

    document.querySelector("#ustTxtGora").style.width = '90%';
    document.querySelector("#ustTxtGora").style.height = '10%';
    document.querySelector("#ustTxtGora").style.margin = '5%';
    document.querySelector("#ustTxtGora").style.fontSize = '2.5vh';
    document.querySelector("#ustTxtGora").style.textAlign = 'center';
    
    const fieldNames = {
        games_played: 'Rozegrane gry',
        games_won: 'Wygrane',
        sinked_sub: 'Zat. okręty podwodne',
        sinked_dest: 'Zat. Kontrtorpedowce',
        sinked_crui: 'Zat. krążowniki',
        sinked_carr: 'Zat. Lotniskowce',
    };

    // Utworzenie elementu tabeli
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '80%';
    table.style.marginLeft = '10%';
    table.style.marginTop = '5%';

    // Iteracja przez dane i tworzenie wierszy
    Object.entries(dane).forEach(([key, value]) => {
        const row = document.createElement('tr');

        // Komórka z nazwą pola (ręcznie ustawioną)
        const keyCell = document.createElement('td');
        keyCell.textContent = fieldNames[key] || key; // Wyświetl nazwę z mapy lub domyślnie klucz
        keyCell.style.border = '0.5vh solid #5cad5f';
        keyCell.style.padding = '0.8vh';

        // Komórka z wartością
        const valueCell = document.createElement('td');
        valueCell.textContent = value;
        valueCell.style.border = '0.5vh solid #5cad5f';
        valueCell.style.padding = '0.8vh';
        valueCell.style.textAlign = 'center';

        // Dodanie komórek do wiersza
        row.appendChild(keyCell);
        row.appendChild(valueCell);

        // Dodanie wiersza do tabeli
        table.appendChild(row);
    });

    // Dodanie tabeli do dokumentu
    table.style.fontSize = '2vh'
    document.querySelector("#interfejsPrawa").appendChild(table);

    const button = document.createElement('button');
    button.id = 'powrot';
    button.className = 'crt';
    button.textContent = 'Powrót';

    button.style.width = '80%';
    button.style.height = '10%';
    button.style.marginLeft = '10%'
    button.style.marginTop = '5%'

    document.querySelector("#interfejsPrawa").appendChild(button);

    document.querySelector("#powrot").addEventListener('click', menuPoZalogowaniu);
}

function startGameGuest()
{
    player = '';
    startGame();
}

function startGame()
{
    let displayName = 'Guest';

    if(!player == '')
    {
        displayName = player;
        aktualizujDane("games_played");
    }

    let html = '';

    html += '<div id="ustTxtGora">';
    html += '<h3>Rozkład floty</h3> <br>';
    html += 'Przy pomocy kursora umieść okręty na polu walki.'
    html += '</div>';
    html += '<div id="ustTxTDol">';
    html += 'Obecnie ustawiany okręt: <h2 id="nazwyOkretow">Lotniskowiec</h2>' 
    html += '</div>'
    html += '<div id="grafikaStatkuStawianie"></div>'
    html += '<button id="resetStawianie" class="crttxt">Reset</button>'

    document.querySelector("#interfejsPrawa").innerHTML = html;

    document.querySelector("#ustTxtGora").style.width = '90%';
    document.querySelector("#ustTxtGora").style.height = '20%';
    document.querySelector("#ustTxtGora").style.margin = '5%';
    document.querySelector("#ustTxtGora").style.fontSize = '2vh';

    document.querySelector("#ustTxTDol").style.width = '90%';
    document.querySelector("#ustTxTDol").style.marginLeft = '5%';
    document.querySelector("#ustTxTDol").style.fontSize = '2vh';

    document.querySelector("#nazwyOkretow").style.marginTop = '5%';
    document.querySelector("#nazwyOkretow").style.textAlign = 'center';

    document.querySelector("#grafikaStatkuStawianie").style.width = '80%';
    document.querySelector("#grafikaStatkuStawianie").style.height = '20%';
    document.querySelector("#grafikaStatkuStawianie").style.margin = '10%';
    document.querySelector("#grafikaStatkuStawianie").style.marginTop = '5%';
    document.querySelector("#grafikaStatkuStawianie").style.border = '#5cad5f solid 0.5vh';
    document.querySelector("#grafikaStatkuStawianie").style.backgroundImage = "url('gfx/placeCarr.png')";
    document.querySelector("#grafikaStatkuStawianie").style.backgroundSize = "cover";

    document.querySelector("#resetStawianie").style.width = '80%';
    document.querySelector("#resetStawianie").style.marginLeft = '10%';

    document.querySelector("#szachwnicaLewa").style.zIndex = 5;
    document.querySelector("#tloLewa").style.backgroundImage = "url('gfx/waterLeftBackground.png')";

    document.querySelector("#resetStawianie").addEventListener('click', resetPlanszy);

    html = '';
    html += `Grasz jako:<br>${displayName}`;
    document.querySelector("#interfejsLewy").innerHTML = html;

    for(let i = 1; i < 11; i++)
        for (let j = 1; j  < 11; j++)
        {
            document.querySelector(`#SzL${i.toString(16)}-${j.toString(16)}`).addEventListener('mouseover',wyswietlStatek);
            document.querySelector(`#SzL${i.toString(16)}-${j.toString(16)}`).addEventListener('mouseout',usunStatek);
            document.querySelector(`#SzL${i.toString(16)}-${j.toString(16)}`).addEventListener('click',postawStatekMat);
            document.querySelector(`#SzL${i.toString(16)}-${j.toString(16)}`).addEventListener('wheel',obrocStatek);
        }
}

function resetPlanszy()
{

    document.querySelector("#obiektyLewa").innerHTML = '';
    
    wskaznik = 0;

    for(let i = 1; i < 11; i++)
    {
        for (let j = 1; j  < 11; j++) 
        {
                matLeft[i][j].isBlocked = false;
                matLeft[i][j].haveShip = false;
        }
    }

    startGame();
}

function wyswietlStatek()
{
    obecnyStatek = tabShips[wskaznik];
    let gfxUrl = 'gfx/'
    elId = this.id;
    const element = document.querySelector(`#${elId.slice(0,3)}${elId[3]}-${elId[5]}`);
    const rect = element.getBoundingClientRect();
    const warotscObrotu = kierunek*90;

    switch(obecnyStatek)
    {
        case 0:
            gfxUrl += "sub.png";
            dlug = 2;
            break;
        case 1:
            gfxUrl += "destr.png";
            dlug = 3;
            break;
        case 2:
            gfxUrl += "cruis.png";
            dlug = 4;
            break;
        case 3:
            gfxUrl += "carr.png";
            dlug = 5;
            break;
        default:
            alert("COŚ SPARTOLIŁEŚ PRZY WYŚWIETLANIU")
    }

    const container = document.querySelector("#obiektyLewa");
    const containerRect = container.getBoundingClientRect();

    const topPosition = rect.top - containerRect.top;
    const leftPosition = rect.left - containerRect.left;

    const div = document.createElement('div');

    div.classList.add("shipGfx", `ship${wskaznik}`);
    div.style.position = 'absolute';
    div.style.top = `${topPosition}px`;
    div.style.left = `${leftPosition}px`;
    div.style.width = `${dlug}0%`;
    div.style.height = `10%`;
    div.style.backgroundImage = `url(${gfxUrl})`;
    div.style.transformOrigin = `${100/dlug/2}% 50%`;
    div.style.transform = `rotate(${warotscObrotu}deg)`;

    if(sprawdzCzyStatek(matLeft))
    {
        czyMoznaPostawic = true;
        div.style.backgroundColor = ``;
    }
    else
    {
        czyMoznaPostawic = false;
        div.style.backgroundColor = `#a14d43`;
    }

    container.appendChild(div);
}

function usunStatek()
{
    const element = document.querySelector(`.ship${wskaznik}`);
    if (element) {
        element.remove();
    }
}

function obrocStatek()
{
    const scrollDirection = event.deltaY > 0 ? 'down' : 'up';

    // Tutaj wykonujemy akcję w zależności od kierunku przewijania
    if (scrollDirection === 'down')
        if (kierunek < 3)
            kierunek++;
        else
            kierunek = 0;
    else 
        if (kierunek > 0)
            kierunek--;
        else
            kierunek = 3;
    
    //console.log("Kierunek: " + kierunek);

    const warotscObrotu = kierunek*90;
    const element = document.querySelector(`.ship${wskaznik}`);
    element.style.transform = `rotate(${warotscObrotu}deg)`;
    
    if(sprawdzCzyStatek(matLeft))
        {
            czyMoznaPostawic = true;
            element.style.backgroundColor = ``;
        }
        else
        {
            czyMoznaPostawic = false;
            element.style.backgroundColor = `#a14d43`;
        }
}

function postawStatekMat()
{
    if(turaGracza)
        postawStatek(matLeft);
    else
        postawStatek(matRight);
}

function postawStatek(mat)
{
    if(wskaznik < tabShips.length)
    {    
        if(czyMoznaPostawic)
        {
            //console.log("Można stawiać")
            let y;
            let x;
        
            y = parseInt(elId[3], 10); 
            x = parseInt(elId[5], 10);

            //console.log(`PRZED isNaN x: ${x} y: ${y}`);
        
            if (isNaN(y)) y = 10; 
            if (isNaN(x)) x = 10;

            //console.log(`PO isNaN x: ${x} y: ${y}`);

            for(let i = 0; i <dlug; i++)
                switch(kierunek)
                {
                    case 0:
                        for(let i = 0; i < dlug; i++)
                        {
                            mat[y][x+i].haveShip = true;
                        }
                        break;

                    case 1:
                        for(let i = 0; i < dlug; i++)
                        {
                            mat[y+i][x].haveShip = true;
                        }
                        break;

                    case 2:
                        for(let i = 0; i < dlug; i++)
                        {
                            mat[y][x-i].haveShip = true;
                        }
                        break;

                    case 3:
                        for(let i = 0; i < dlug; i++)
                        {
                            mat[y-i][x].haveShip = true;
                        }
                        break;
                }

                wskaznik++;
                
                if(turaGracza && wskaznik < tabShips.length)
                {
                obecnyStatek = tabShips[wskaznik];
                const element = document.querySelector('#nazwyOkretow');
                const ikona = document.querySelector('#grafikaStatkuStawianie');

                switch(obecnyStatek)
                {
                    case 0:
                        element.innerHTML = 'Okręt podwodny';
                        ikona.style.backgroundImage = "url('gfx/placeSub.png')"
                        break;
                    case 1:
                        element.innerHTML = 'Kontrtorpedowiec';
                        ikona.style.backgroundImage = "url('gfx/placeDestr.png')"
                        break;
                    case 2:
                        element.innerHTML = 'Krążownik';
                        ikona.style.backgroundImage = "url('gfx/placeCrui.png')"
                        break;
                    case 3:
                            element.innerHTML = 'Lotniskowiec';
                        ikona.style.backgroundImage = "url('gfx/placeCarr.png')"
                        break;
                    default:
                    alert("COŚ SPARTOLIŁEŚ PRZY STAWIANIU")
                }
            }

            if (turaGracza && wskaznik == tabShips.length)
            {
                for(let i = 1; i < 11; i++)
                    for (let j = 1; j  < 11; j++)
                    {
                        document.querySelector(`#SzL${i.toString(16)}-${j.toString(16)}`).removeEventListener('mouseover',wyswietlStatek);
                        document.querySelector(`#SzL${i.toString(16)}-${j.toString(16)}`).removeEventListener('mouseout',usunStatek);
                        document.querySelector(`#SzL${i.toString(16)}-${j.toString(16)}`).removeEventListener('click',postawStatekMat);
                        document.querySelector(`#SzL${i.toString(16)}-${j.toString(16)}`).removeEventListener('wheel',obrocStatek);
                    }
                turaGracza = false;
                wskaznik = 0;
                startVsAi();
            }
        }
        //else console.log("nie masz prawa do stawiania D:")
    }
}

function sprawdzCzyStatek(mat)
{
    let y;
    let x;

    y = parseInt(elId[3], 10); 
    x = parseInt(elId[5], 10);
    
    let blockCount = 0;

    if (isNaN(y)) y = 10; 
    if (isNaN(x)) x = 10;

    //console.log(y + " " + x);

    //wartości kierunku
    //0 - prawo
    //1 - dół
    //2 - lewo
    //3 - góra

    switch(kierunek)
    {
        case 0:
            for(let i = 0; i < dlug; i++)
            {
                if(mat[y][x+i].isBlocked)
                    blockCount++;

                if(blockCount > 0)
                    break;
            }

            for(let i = -1; i <= dlug; i++)
            {
                if(mat[y-1][x+i].haveShip)
                {
                    blockCount++;
                }

                if(mat[y][x+i].haveShip)
                    blockCount++;

                if(mat[y+1][x+i].haveShip)
                    blockCount++;

                if(blockCount > 0) break;
            }
        break;

        case 1:
            for(let i = 0; i < dlug; i++)
            {
                if(mat[y+i][x].isBlocked)
                    blockCount++;

                if(blockCount > 0)
                    break;
            }

            for(let i = -1; i <= dlug; i++)
            {    
                if(mat[y+i][x-1].haveShip)
                    blockCount++;

                if(mat[y+i][x].haveShip)
                    blockCount++;

                if(mat[y+i][x+1].haveShip)
                    blockCount++;

                if(blockCount > 0) break;

            }
        break;

        case 2:
            for(let i = 0; i < dlug; i++)
            {
                if(mat[y][x-i].isBlocked)
                    blockCount++;

                if(blockCount > 0)
                    break;
            }

            for(let i = -1; i <= dlug; i++)
            {
                if(mat[y-1][x-i].haveShip)
                    blockCount++;

                if(mat[y][x-i].haveShip)
                    blockCount++;

                if(mat[y+1][x-i].haveShip)
                    blockCount++;

                if(blockCount > 0) break;
            }
        break;

        case 3:
            for(let i = 0; i < dlug; i++)
                {
                    if(mat[y-i][x].isBlocked)
                        blockCount++;

                    if(blockCount > 0)
                        break;
                }

            for(let i = -1; i <= dlug; i++)
            {
                if(mat[y-i][x-1].haveShip)
                    blockCount++;

                if(mat[y-i][x].haveShip)
                    blockCount++;

                if(mat[y-i][x+1].haveShip)
                    blockCount++;

                if(blockCount > 0) break;
            }
        break;
    }

    if(blockCount > 0)
    {
        //console.log("POLE NIEDOSTĘPNE");
        return false;
    }
    else
    {
        //console.log("POLE DOSTĘPNE");
        return true;
    }
}

function startVsAi()
{
    okretyNasze = [1,2,1,1];
    okretyWroga = [1,2,1,1];

    document.querySelector("#interfejsPrawa").style.zIndex = -10;
    document.querySelector("#szachwnicaPrawa").style.zIndex = 10;
    document.querySelector("#filtrPrawa").style.zIndex = 5;
    document.querySelector("#tloPrawa").style.backgroundImage = "url('gfx/backgroundRightGame.png')";
    document.querySelector("#interjefsPrawy").style.backgroundImage = "url('gfx/ikonyStatki.png')"

    let html = '';

    html += `<div class = "prostokat"></div>`
    html += `<div class = "prostokat"></div>`
    html += `<div class = "prostokat"></div>`
    html += `<div class = "prostokat"></div>`
    html += `<div class = "prostokat"></div>`

    document.querySelector("#interjefsPrawy").innerHTML = html;

    let i = 0;
    let randX;
    let randY;
    wskaznik = 0;

    while(i < 5)
    {
        randX = Math.floor(Math.random() * 10 + 1);
        randY = Math.floor(Math.random() * 10 + 1);
        kierunek = Math.round(Math.random() * 3)

        elId = `#SzP${randX.toString(16)}-${randY.toString(16)}`;
        const element = document.querySelector(elId);
        elId = element.id;
        //console.log(element);
        element.place = postawStatekMat;
        element.check = sprawdzCzyStatek;

        obecnyStatek = tabShips[wskaznik];
    
        switch(obecnyStatek)
        {
            case 0:
                dlug = 2;
                break;
            case 1:
                dlug = 3;
                break;
            case 2:
                dlug = 4;
                break;
            case 3:
                dlug = 5;
                break;
            default:
                alert("COŚ SPARTOLIŁEŚ PRZY STAWIANIU AI")
        }

        //console.log(`${elId} ` + kierunek + " dlugosc: " + dlug);   

        try
        {
            if(element.check(matRight))
                {
                czyMoznaPostawic = true;
                element.place();
                //console.log("postawiono statek " + i)
                i++;
                }
            else
                czyMoznaPostawic = false;
        }
        catch(error)
        {
            console.log("nie postawiono statku z powodu błędu")
        }
    }

    for(let i = 1; i < 11; i++)
    {
        for (let j = 1; j  < 11; j++) 
        {
            document.querySelector(`#SzP${i.toString(16)}-${j.toString(16)}`).addEventListener('click', oddajStrzalMat);
        }
    }

    turaGracza = true;
    document.querySelector('#ikonyPrawa').style.zIndex = 0;
    document.querySelector('#interfejsSrodek').innerHTML = "Czekanie na rozkaz"

    //debuger do pokazywania gdzie się ustawiły statki
    // for(let i = 1; i < 11; i++)
    //     {
    //         for (let j = 1; j  < 11; j++) 
    //         {
    //             if(matRight[i][j].haveShip)
    //                 document.querySelector(`#SzP${i.toString(16)}-${j.toString(16)}`).style.backgroundColor = "red";
    //         }
    //     }
}

function oddajStrzalMat()
{
    elId = this.id;

    if(turaGracza)
        oddajStrzal(matRight);
}

function oddajStrzal(mat)
{
    //console.log("oddanno strzal");

    y = parseInt(elId[3], 10); 
    x = parseInt(elId[5], 10);

    //console.log(`PRZED isNaN x: ${x} y: ${y}`);

    if (isNaN(y)) y = 10; 
    if (isNaN(x)) x = 10;

    //console.log(`PO isNaN x: ${x} y: ${y}`);

    if(!mat[y][x].hasBeenShoot)
    {
        let gfxUrl 

        if(turaGracza)
            gfxUrl= 'gfx/strzalPudlo.png'
        else
            gfxUrl= 'gfx/strzalPudloWrog.png'

        if(mat[y][x].haveShip)
        {
            mat[y+1][x+1].hasBeenShoot = true;
            elId = `${elId.slice(0,3)}${(y+1).toString(16)}-${(x+1).toString(16)}`;
            postawZnakStrzalu(gfxUrl);

            mat[y+1][x-1].hasBeenShoot = true;
            elId = `${elId.slice(0,3)}${(y+1).toString(16)}-${(x-1).toString(16)}`;
            postawZnakStrzalu(gfxUrl);

            mat[y-1][x-1].hasBeenShoot = true;
            elId = `${elId.slice(0,3)}${(y-1).toString(16)}-${(x-1).toString(16)}`;
            postawZnakStrzalu(gfxUrl);

            mat[y-1][x+1].hasBeenShoot = true;
            elId = `${elId.slice(0,3)}${(y-1).toString(16)}-${(x+1).toString(16)}`;
            postawZnakStrzalu(gfxUrl);

            if(turaGracza)
                gfxUrl = 'gfx/strzalTrafienie.png'
            else
                gfxUrl = 'gfx/strzalTrafienieWrog.png'

            if(sprawdzCzyZatopiony(mat,x,y))
            {
                document.querySelector("#interfejsSrodek").innerHTML = "Trafiony zatopiony!";
                odznaczPoZatopieniu(mat,x,y);
            }
            else
                document.querySelector("#interfejsSrodek").innerHTML = "Trafiony!";
        }
        else
        {
            document.querySelector("#interfejsSrodek").innerHTML = "Pudło!";
            
            turaGracza = !turaGracza;
        }

    mat[y][x].hasBeenShoot = true;
    elId = `${elId.slice(0,3)}${y.toString(16)}-${x.toString(16)}`
    postawZnakStrzalu(gfxUrl);

    sprawdzKtoWygral();

    if(!turaGracza)
        setTimeout(() => {
            ruchAI();
        }, 500);
    }
    else
        console.log("Tu już oddano strzał");
}

function postawZnakStrzalu(gfxUrl)
{
    const element = document.querySelector(`#${elId}`);
    //console.log(elId);
    //console.log(element);
    const rect = element.getBoundingClientRect();

    const container = document.querySelector("#ikonyPrawa");
    const containerRect = container.getBoundingClientRect();

    const topPosition = rect.top - containerRect.top;
    const leftPosition = rect.left - containerRect.left;

    const div = document.createElement('div');

    div.classList.add("shipGfx");
    div.style.position = 'absolute';
    div.style.top = `${topPosition}px`;
    div.style.left = `${leftPosition}px`;
    div.style.width = `10%`;
    div.style.height = `10%`;
    div.style.backgroundImage = `url(${gfxUrl})`;

    container.appendChild(div);
}

function sprawdzCzyZatopiony(mat,x,y)
{
    let nietrafione = 0;

    let i = 1;

    //console.log(`x: ${x} y: ${y}`)

    while (mat[y+i][x].haveShip)
    {
        if(!mat[y+i][x].hasBeenShoot)
            nietrafione++;
        i++;
    }
    i = 1;

    while (mat[y-i][x].haveShip)
    {
        if(!mat[y-i][x].hasBeenShoot)
            nietrafione++;
        i++;
    }
    i = 1;

    while (mat[y][x+i].haveShip)
    {
        if(!mat[y][x+i].hasBeenShoot)
            nietrafione++;
        i++;
    }
    i = 1;

    while (mat[y][x-i].haveShip)
    {
        if(!mat[y][x-i].hasBeenShoot)
            nietrafione++;
        i++;
    }

    //console.log(nietrafione);

    if(nietrafione==0)
        return true;
    else
        return false;
}

function odznaczPoZatopieniu(mat,x,y)
{
    let i = 1;
    let dlStatku = 1;

    let gfxUrl

    if(turaGracza)
        gfxUrl = 'gfx/strzalPudlo.png';
    else
        gfxUrl = 'gfx/strzalPudloWrog.png'

    while (mat[y+i][x].haveShip)
    {
        dlStatku++;
        i++;
    }
    
    elId = `${elId.slice(0,3)}${(y+i).toString(16)}-${(x).toString(16)}`;
    mat[y+i][x].hasBeenShoot = true;
    postawZnakStrzalu(gfxUrl);
    i = 1;
    
    while (mat[y-i][x].haveShip)
    {
        dlStatku++;
        i++;
    }

    elId = `${elId.slice(0,3)}${(y-i).toString(16)}-${(x).toString(16)}`;
    mat[y-i][x].hasBeenShoot = true;
    postawZnakStrzalu(gfxUrl);
    i = 1;

    while (mat[y][x+i].haveShip)
    {
        dlStatku++;
        i++;
    }

    elId = `${elId.slice(0,3)}${(y).toString(16)}-${(x+i).toString(16)}`;
    mat[y][x+i].hasBeenShoot = true;
    postawZnakStrzalu(gfxUrl);
    i = 1;

    while (mat[y][x-i].haveShip)
    {
        dlStatku++;
        i++;
    }

    elId = `${elId.slice(0,3)}${(y).toString(16)}-${(x-i).toString(16)}`;
    mat[y][x-i].hasBeenShoot = true;
    postawZnakStrzalu(gfxUrl);

    if(turaGracza)
    {
        okretyWroga[dlStatku-2]--;
        zgasDiode(dlStatku);
    }
    else
        okretyNasze[dlStatku-2]--;
}

function zgasDiode(dlStatku)
{
    switch(dlStatku)
    {
        case 5:
            aktualizujDane("sinked_carr");
            document.querySelector('.prostokat:first-child').style.backgroundColor = 'transparent';
            break;

        case 4:
            aktualizujDane("sinked_crui");
            document.querySelectorAll('.prostokat')[1].style.backgroundColor = 'transparent';
            break;

        case 3:
            aktualizujDane("sinked_dest");
            if(document.querySelector('.prostokat:last-child').style.backgroundColor == 'transparent')
                document.querySelectorAll('.prostokat')[2].style.backgroundColor = 'transparent';
            else
                document.querySelector('.prostokat:last-child').style.backgroundColor = 'transparent';
            break;

        case 2:
            aktualizujDane("sinked_sub");
            document.querySelectorAll('.prostokat')[3].style.backgroundColor = 'transparent';
            break;

        default:
            console.log("coś spartoliłęś cymbale");

    }
}

function sprawdzKtoWygral()
{
    let sumaWrog = 0;
    let sumaGracz = 0;

    for(let i = 0; i < okretyWroga.length; i++)
    {
        sumaWrog += okretyWroga[i];
        sumaGracz += okretyNasze[i];
    }

    if(sumaWrog == 0)
        wygranaGracza();

    if(sumaGracz == 0)
        wygranaAi();
}

function ruchAI()
{
    turaGracza = false;

    if(AI.x != null)
    {
        if(AI.sciana > 3 || sprawdzCzyZatopiony(matLeft, AI.x, AI.y))
            AI = 
            {
                y: null,
                x: null,
                yObecne: null,
                xObecne: null,
                pion: null,
                zmiennik: null,
                sciana: 0
            }
    }

    if(AI.x == null && AI.y == null)
    {    
        do
        {
            AI.xObecne = Math.floor(Math.random() * 10 + 1);
            AI.yObecne = Math.floor(Math.random() * 10 + 1);
        }
        while(matLeft[AI.yObecne][AI.xObecne].hasBeenShoot);

        elId = `#SzL${AI.yObecne.toString(16)}-${AI.xObecne.toString(16)}`;

        if(matLeft[AI.yObecne][AI.xObecne].haveShip)
        {
            AI.x = AI.xObecne;
            AI.y = AI.yObecne;
            //console.log("zapamiętano wspórzędne trafienia")
        }
    }
    else
    {
        if (AI.pion == null)
            AI.pion = Math.random() > 0.5;

        if (AI.zmiennik == null)
        {
            if(Math.random() > 0.5)
                AI.zmiennik = 1;
            else
                AI.zmiennik = -1;
        }

        if(AI.pion)
        {
            if(!matLeft[AI.yObecne + AI.zmiennik][AI.xObecne].hasBeenShoot)
                AI.yObecne += AI.zmiennik;
            else
            {
                AI.zmiennik *= -1;
                AI.sciana ++;
                AI.yObecne = AI.y;

                if(!matLeft[AI.yObecne + AI.zmiennik][AI.xObecne].hasBeenShoot)
                    AI.yObecne += AI.zmiennik;
                else
                {
                    zmiennik = null;
                    AI.sciana ++;
                    AI.yObecne = AI.y;
                    AI.pion = false;
                    ruchAI();
                    return;
                }
            }
        }
        else
        {
            if(!matLeft[AI.yObecne][AI.xObecne + AI.zmiennik].hasBeenShoot)
                AI.xObecne += AI.zmiennik;
            else
            {
                AI.zmiennik *= -1;
                AI.sciana ++;
                AI.xObecne = AI.x;

                if(!matLeft[AI.yObecne][AI.xObecne + AI.zmiennik].hasBeenShoot)
                    AI.xObecne += AI.zmiennik;
                else
                {
                    zmiennik = null;
                    AI.sciana ++;
                    AI.xObecne = AI.x;
                    AI.pion = false;
                    ruchAI();
                    return;
                }
            }
        }
    }

    if(matLeft[AI.yObecne][AI.xObecne].hasBeenShoot)
        {
            //console.log("aktywacja pętli bezpieczeństwa: " + AI.yObecne + " " + AI.xObecne);
            do
            {
                AI.xObecne = Math.floor(Math.random() * 10 + 1);
                AI.yObecne = Math.floor(Math.random() * 10 + 1);
            }
            while(matLeft[AI.yObecne][AI.xObecne].hasBeenShoot);
        }
    
    elId = `#SzL${AI.yObecne.toString(16)}-${AI.xObecne.toString(16)}`;
        
    if(AI.x != null)
    {
        if(AI.pion)
            {
                if(!matLeft[AI.yObecne][AI.xObecne].haveShip)
                {
                    AI.zmiennik *= -1;
                    AI.sciana ++;
                    AI.yObecne = AI.y;

                    if(AI.sciana % 2 == 0)
                        AI.pion = !AI.pion;  
                }
            }
            else
            {
                if(!matLeft[AI.yObecne][AI.xObecne].haveShip)
                {
                    AI.zmiennik *= -1;
                    AI.sciana ++;
                    AI.xObecne = AI.x;

                    if(AI.sciana % 2 == 0)
                        AI.pion = !AI.pion;  
                }
            }
    }

    if(elId[0] != '#')
        elId = `#${elId}`;

    const element = document.querySelector(elId);
    //console.log(elId);
    //console.log(element);
    elId = element.id;
    element.strzel = oddajStrzal;
    element.sprawdz = sprawdzCzyZatopiony;

    turaGracza = false;

    element.strzel(matLeft);
}


function wygranaGracza()
{
    document.querySelector("#interfejsSrodek").innerHTML = "ZWYCIĘSTWO!!!";
    aktualizujDane("games_won");
    koniecGry();
}

function wygranaAi()
{
    document.querySelector("#interfejsSrodek").innerHTML = "PORAŻKA";
    koniecGry();
}

function koniecGry()
{
    turaGracza = true;

    matLeft = Array(matSize).fill().map(() => Array(matSize).fill().map(() => ({
        isBlocked: false,
        haveShip: false,
        hasBeenShoot: false
    })));
    
    matRight = Array(matSize).fill().map(() => Array(matSize).fill().map(() => ({
        isBlocked: false,
        haveShip: false,
        hasBeenShoot: false
    })));

    for(let i = 0; i < 12; i++)
        for (let j = 0; j  < 12; j++) {
            if(i == 0 || i == 11 || j == 0 || j == 11)
            {
                matLeft[i][j].isBlocked = true;
                matLeft[i][j].hasBeenShoot = true;
                matRight[i][j].isBlocked = true;
                matRight[i][j].hasBeenShoot = true;
            }
        }

    for(let i = 1; i < 11; i++)
        {
            for (let j = 1; j  < 11; j++) 
            {
                document.querySelector(`#SzP${i.toString(16)}-${j.toString(16)}`).removeEventListener('click', oddajStrzalMat);
            }
        }

    wskaznik = 0;

    document.querySelector("#interjefsPrawy").style.backgroundImage = 'none';
    document.querySelector("#interjefsPrawy").innerHTML = `<button id="powrotMenu" class="crttxt">Menu</button>`;

    document.querySelector("#powrotMenu").style.margin = 'auto';
    document.querySelector("#powrotMenu").style.height = '50%';

    document.querySelector("#powrotMenu").addEventListener('click', czystka);
}

async function aktualizujDane(dane)
{
    if(player != '')
    {
        const daneInc = 
            {
                username: player,
                increment: dane
            }

        const dataToSend = new FormData();
        dataToSend.append('json', JSON.stringify(daneInc))

        try
        {
            let response = await fetch('api/increment.php', {
                method: 'POST',
                mode: 'cors',
                body: dataToSend
            });

            let result = await response.json();

            if (response.ok)
                if(result.message !== 'error')
                {
                    console.log(result.message);
                }
                else
                {
                    alert(result.error)
                }

        }
        catch(err)
        {
            alert(err);
        }
    }
}

function czystka()
{
    document.querySelector("#tloLewa").style.backgroundImage = 'url("gfx/menuLeftBackground.png")';
    document.querySelector("#szachwnicaLewa").style.zIndex = 0;
    document.querySelector("#obiektyLewa").innerHTML = '';

    document.querySelector("#szachwnicaPrawa").style.zIndex = 0;
    document.querySelector("#tloPrawa").style.backgroundImage = 'url("gfx/BackgroundRight.png")';
    document.querySelector("#interfejsPrawa").innerHTML = '';
    document.querySelector("#interfejsPrawa").style.zIndex = 10;
    document.querySelector("#ikonyPrawa").innerHTML = '';
    document.querySelector("#filtrPrawa").style.zIndex = -10;
    document.querySelector("#ikonyPrawa").style.zIndex = -10;

    document.querySelector("#interfejsLewy").innerHTML = '';
    document.querySelector("#interfejsSrodek").innerHTML = '';
    document.querySelector("#interjefsPrawy").innerHTML = '';
    mainMenu();
}