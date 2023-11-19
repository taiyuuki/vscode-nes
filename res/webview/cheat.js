class Cheat {

    static reg = /([\da-fA-F]{4})-([0-3])(\d)-([\da-fA-F]{2,})/

    constructor() {
        this.enable = false
        this.fixed = {}
        this.greater = {}
        this.lesser = {}
    }

    valid(cheatCode) {
        return Cheat.reg.test(cheatCode)
    }

    cheatType(cheatCode) {
        const matchs = Cheat.reg.exec(cheatCode)
        if (!matchs) {
            return
        }
        return toHexNumber(matchs[2])
    }

    parse(cheatCode) {
        const matchs = Cheat.reg.exec(cheatCode)

        if (!matchs) {
            emitError('无效的金手指。')
            return
        }

        const cheatAddress = toHexNumber(matchs[1])
        if (cheatAddress > 0xffff) {
            emitError('无效的金手指。')
            return
        }

        const cheatType = toHexNumber(matchs[2])
        const cheatValue = toHexNumber(matchs[4])

        this.on(cheatAddress, cheatType, cheatValue)
    }

    on(cheatAddress, cheatType, cheatValue) {
        this.enable || (this.enable = true)
        switch (cheatType) {
            case 0:
                this.fixed[cheatAddress] = cheatValue
                break
            case 1:
                nes.cpu.mem[cheatAddress] = cheatValue
                break
            case 2:
                this.lesser[cheatAddress] = cheatValue
                break
            case 3:
                this.greater[cheatAddress] = cheatValue
                break
        }
    }

    remove(cheatAddress) {
        delete this.fixed[cheatAddress]
        delete this.greater[cheatAddress]
        delete this.lesser[cheatAddress]
    }

    disable(cheatCode) {
        const matchs = Cheat.reg.exec(cheatCode)
        if (!matchs) {
            return
        }
        const cheatAddress = toHexNumber(matchs[1])
        this.remove(cheatAddress)
    }

    init() {
        this.enable = false
        this.fixed = {}
        this.greater = {}
        this.lesser = {}
    }

    onFrame() {
        if (this.enable) {
            Object.entries(this.fixed).forEach(([address, value]) => {
                nes.cpu.mem[address] = value
            })
            Object.entries(this.greater).forEach(([address, value]) => {
                if (nes.cpu.mem[address] < value) {
                    nes.cpu.mem[address] = value
                }
            })
            Object.entries(this.lesser).forEach(([address, value]) => {
                if (nes.cpu.mem[address] > value) {
                    nes.cpu.mem[address] = value
                }
            })
        }
    }
}

const cheat = new Cheat()
const list = document.querySelector("#cheat-list")
let vList = {}

function saveList() {
    if (Object.keys(vList).length === 0) {
        localStorage.removeItem(gameId() + "-cheat-codes")
        return
    }
    localStorage.setItem(gameId() + "-cheat-codes", JSON.stringify(vList))
}

function loadList() {
    const listData = localStorage.getItem(gameId() + "-cheat-codes")
    if (listData) {
        vList = JSON.parse(listData)
    } else {
        vList = {}
    }
    renderList()
}

function clearList() {
    list.innerHTML = ""
    vList = {}
}

function renderList() {
    list.innerHTML = ""
    const fragment = document.createDocumentFragment()
    Object.entries(vList).forEach(([code, name]) => {
        const newCheat = document.createElement("div")
        newCheat.className = "cheat-item"

        const deleteDiv = document.createElement("div")
        deleteDiv.textContent = "X"
        deleteDiv.className = "list-cheat-delete"
        deleteDiv.setAttribute("title", "删除该金手指")
        deleteDiv.addEventListener("click", () => {
            delete vList[code]
            saveList()
            renderList()
        })
        newCheat.appendChild(deleteDiv)

        const nameDiv = document.createElement("div")
        nameDiv.textContent = name
        nameDiv.className = "list-cheat-name"
        newCheat.appendChild(nameDiv)

        const codeDiv = document.createElement("div")
        codeDiv.className = "list-cheat-code"
        codeDiv.textContent = code
        newCheat.appendChild(codeDiv)

        if (cheat.cheatType(code) === 1) {
            const btn = document.createElement("input")
            btn.type = "button"
            btn.value = "执行"
            btn.style.flex = "1"
            btn.addEventListener("click", () => {
                cheat.parse(code)
            })
            newCheat.appendChild(btn)
        } else {
            const checkBox = document.createElement("input")
            checkBox.type = "checkbox"
            checkBox.checked = false
            checkBox.style.flex = "1"
            checkBox.addEventListener("change", () => {
                if (checkBox.checked) {
                    cheat.parse(code)
                } else {
                    cheat.disable(code)
                }
            })
            newCheat.appendChild(checkBox)
        }


        fragment.appendChild(newCheat)
    })
    document.querySelector("#cheat-list").appendChild(fragment)
}

function add() {
    const $code = document.querySelector("#ipt-code")

    let code = $code.value.trim().toUpperCase()
    if (code === "") {
        emitError('金手指代码不能为空。')
        return
    }
    if (!cheat.valid(code)) {
        emitError('无效的金手指。')
        return
    }
    const $name = document.querySelector("#ipt-name")
    const name = $name.value || "未命名"

    if (vList[code]) {
        emitError('该金手指已存在。')
        return
    }

    vList[code] = name

    saveList()

    renderList()

    $name.value = ""
    $code.value = ""
}

document.querySelector("#ipt-add").addEventListener("click", add)