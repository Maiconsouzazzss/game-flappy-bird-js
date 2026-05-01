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

