let canvasDiv = document.getElementById('all-canvas')
let loadData = document.getElementById('load-csv')
let exportBtn = document.getElementById('btn-sauvegarde-cartes')
let cardWidth = 400
let cardHeight = 600
let radius = 20

class Card {
    canvas = null
    ctx = null
    cardData = null
    static typesData = null
    static canvasId = 0


    constructor(csvData) {
        this.cardData = csvData
        let canvas = document.createElement('canvas')
        canvas.width = "400"
        canvas.height = "600"
        canvas.dataset.id = Card.canvasId++
        canvasDiv.append(canvas)
        this.canvas = canvas
        this.ctx = this.canvas.getContext('2d')
    }

    drawImage(src, x, y, w, h) {
        let image = new Image(w, h)
        image.src = src
        image.onload = () => this.ctx.drawImage(image, x, y, w, h)
        image.crossOrigin = "anonymous"
    }

    draw() {
        this.canvas.dataset.id = this.canvas.dataset.id + "_" + this.cardData.Nom
        let type = Card.typesData.get(this.cardData.Type)

        // Fond transparent
        this.ctx.fillStyle = '#FFFFFF00'
        this.ctx.fill()

        // Bord
        let borderWidth = 20
        let border = getRoundedRectangle(0,0,cardWidth,cardHeight, 20)
        if (type) {
            this.ctx.fillStyle = type.CouleurPrincipale
        } else {
            this.ctx.fillStyle = '#555555'
        }
        this.ctx.fill(border)
        let insideBorder = getRoundedRectangle(borderWidth, borderWidth, cardWidth - borderWidth, cardHeight - borderWidth, borderWidth)
        this.ctx.fillStyle = '#FFFFFFaa'
        this.ctx.fill(insideBorder)

        // Icon
        let iconSize = 64
        let marginX = 0
        let marginY = 5
        this.drawImage("Images/Icon_" + this.cardData.Type,
            marginX, marginY, iconSize, iconSize)

        // Cost
        let xCout = marginX + iconSize / 2
        let yCout =  1.5 * iconSize + 2 * marginY
        this.ctx.fillStyle = '#999999'
        this.ctx.beginPath()
        this.ctx.arc(xCout, yCout, iconSize / 2, 0, 2 * Math.PI, true)
        this.ctx.fill()
        this.ctx.font = '32px Segoe UI'
        this.ctx.fillStyle = 'black'
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = 'middle'
        this.ctx.fillText(this.cardData.Cost, xCout, yCout)
        this.ctx.textBaseline = 'alphabetic'


        // Illustration
        this.drawImage("Images/" + this.cardData.Img, 100, 100, 200, 200)

        // Titre
        if (this.cardData.Titre) {
            this.ctx.textAlign = "center"
            this.ctx.font = '32px Segoe UI'
            this.ctx.fillStyle = 'black'
            this.ctx.fillText(this.cardData.Titre, 200, 350, 300)
        }

        // Description
        var xDesc, yDesc
        if (this.cardData.Titre) {
            yDesc = 450
        } else {
            yDesc = 450
        }
        if (type.DescriptionCentree) {
            this.ctx.font = '24px Segoe UI'
            this.ctx.textAlign = 'center'
            this.ctx.textBaseline = 'middle'
            xDesc = cardWidth / 2
        } else {
            this.ctx.font = '16px Segoe UI'
            this.ctx.textAlign = 'left'
            this.ctx.textBaseline = 'alphabetic'
            xDesc = 50
        }
        this.ctx.fillText(this.cardData.Description, xDesc, yDesc, 300)
    }
}

function getRoundedRectangle(x1, y1, x2, y2, radius) {
    border = new Path2D()
    border.moveTo(x1 + radius, y1)
    border.lineTo(x2 - radius, y1)
    border.arcTo(x2, y1, x2, y1 + radius, radius)
    border.lineTo(x2, y2 - radius)
    border.arcTo(x2, y2, x2 - radius, y2, radius)
    border.lineTo(x1 + radius, y2)
    border.arcTo(x1, y2, x1, y2 - radius, radius)
    border.lineTo(x1, y1 + radius)
    border.arcTo(x1, y1, x1 + radius, y1, radius)

    return border
}


function drawCard(canvas, ctx, lien) {


    // Mise à jou du fichier
    canvas.toBlob(value => zip.file('Images/Mana_gros.png', value));
}

function drawAllCards(results, file) {
    results.data.forEach((cardData, index) => {
        let card = new Card(cardData)
        card.draw()
    })
}

// Case data is there (launch via http or https protocole)
try {
    fetch('data/cartes.csv').then(
        response => response.text()
    ).then(
        text => Papa.parse(text, {
            'header': true,
            'complete': (result, file) => {
                fetch('data/types.csv').then(
                    response => response.text()
                ).then(
                    text => Papa.parse(text, {
                        'header': true,
                        'complete': (resultTypes, fileTypes) => {
                            let typesData = new Map()
                            resultTypes.data.forEach(typeInCsv => {
                                var keyProperty
                                for (var propertyName in typeInCsv) {
                                    keyProperty = propertyName
                                    break;
                                }
                                if (keyProperty) {
                                    typesData.set(typeInCsv[keyProperty], typeInCsv)
                                }
                            })
                            Card.typesData = typesData
                            drawAllCards(result, file)}
                        }
                    )
                )
            }
        })
    )
} catch (e) {
    console.log("Have to do it manually...")
}


// In other case, user has to load it manually
loadData.onchange = ev => {
    let files = loadData.files
    if (files.length > 0) {
        Papa.parse(files[0], {
            'header': true,
            'complete': drawAllCards
        })
    }
}

exportBtn.onclick = ev => {
    let zip = new JSZip()
    var nbImagesReady = 0
    let allCanvas = document.querySelectorAll('canvas')
    let nbImages = allCanvas.length
    allCanvas.forEach(canvas => {
        canvas.toBlob(blob => {
            zip.file('Images/' + canvas.dataset.id + ".png", blob)
            nbImagesReady++
            if (nbImagesReady == nbImages) {
                zip.generateAsync({type:"blob"})
                    .then(content => saveAs(content, 'Cartes.zip'))
            }
        })
    })
}


