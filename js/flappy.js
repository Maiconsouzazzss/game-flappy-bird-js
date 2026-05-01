function newElement(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barrier(reverse = false) {
    this.element = newElement('div', 'barrier')

    const border = newElement('div', 'border')
    const body = newElement('div', 'body')

    this.element.appendChild(reverse ? body : border)
    this.element.appendChild(reverse ? border : body)

    this.setHeight = height => body.style.height = `${height}px`
}

function BarrierPair(height, gap, x) {
    this.element = newElement('div', 'barrier-pair')

    this.top = new Barrier(true)
    this.bottom = new Barrier(false)

    this.element.appendChild(this.top.element)
    this.element.appendChild(this.bottom.element)

    this.randomizeGap = () => {
        const topHeight = Math.random() * (height - gap)
        const bottomHeight = height - gap - topHeight
        
        this.top.setHeight(topHeight)
        this.bottom.setHeight(bottomHeight)
    }

    this.getX = () => parseInt(this.element.style.left) || 0
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.randomizeGap()
    this.setX(x)
}

function Barriers(height, width, gap, space, notifyPoint) {
    this.pairs = [
        new BarrierPair(height, gap, width),
        new BarrierPair(height, gap, width + space),
        new BarrierPair(height, gap, width + space * 2),
        new BarrierPair(height, gap, width + space * 3)
    ]

    const offset = 3

    this.animate = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - offset)

            // quando o elemento sair da área do jogo
            if (pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + space * this.pairs.length)
                pair.randomizeGap()
            }

            const middle = width / 2
            const crossedMiddle = pair.getX() + offset >= middle
                && pair.getX() < middle
            
            if (crossedMiddle) notifyPoint()
        })
    }
}

function Bird(gameHeight) {
    let flying = false

    this.element = newElement('img', 'bird')
    this.element.src = 'imagens/passaro.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => flying = true
    window.onkeyup = e => flying = false

    this.animate = () => {
        const newY = this.getY() + (flying ? 8 : -5)
        const maxHeight = gameHeight - this.element.clientHeight

        if (newY <= 0) {
            this.setY(0)
        } else if (newY >= maxHeight) {
            this.setY(maxHeight)
        } else {
            this.setY(newY)
        }
    }

    this.setY(gameHeight / 2)
}

function Score() {
    this.element = newElement('span', 'score')

    this.updatePoints = points => {
        this.element.innerHTML = points
    }
    this.updatePoints(0)
}

function areOverlapping(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}

function collided(bird, barriers) {
    let collided = false

    barriers.pairs.forEach(pair => {
        if (!collided) {
            const top = pair.top.element
            const bottom = pair.bottom.element
    
            collided = areOverlapping(bird.element, top) 
                || areOverlapping(bird.element, bottom)
        }
    })

    return collided
}

function FlappyBird() {
    let points = 0

    const gameArea = document.querySelector('[tp-flappy]')
    const height = gameArea.clientHeight
    const width = gameArea.clientWidth

    const score = new Score()
    const barriers = new Barriers(height, width, 200, 400, 
        () => score.updatePoints(++points))

    const bird = new Bird(height)

    gameArea.appendChild(score.element)
    gameArea.appendChild(bird.element)

    barriers.pairs.forEach(pair => gameArea.appendChild(pair.element))

    this.start = () => {
        const timer = setInterval(() => {
            barriers.animate()
            bird.animate()

            if (collided(bird, barriers)) {
                clearInterval(timer)
            }
        }, 20)
    }
}

new FlappyBird().start()