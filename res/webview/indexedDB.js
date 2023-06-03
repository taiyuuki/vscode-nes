const dateBase = window.indexedDB
const version = 1
const dbName = 'vscode_nes'
const storeName = 'save_data'
const res = dateBase.open(dbName, version)
let db = null

res.onsuccess = (e) => {
    if (e.target) {
        db = e.target.result
    }
}

res.onerror = () => {
    console.error('indexedDB load error')
}

res.onupgradeneeded = (e) => {
    if (e.target) {
        db = e.target.result
        if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' })
        }
    }
}

function saveData({ data, onSuccess, onError }) {
    const res = db.transaction([storeName], 'readwrite').objectStore(storeName).add(data)
    res.onsuccess = onSuccess
    res.onerror = (e) => {
        const error = e.target.error
        onError(error?.code)
    }
}

function putData({ data, onSuccess, onError }) {
    const res = db.transaction([storeName], 'readwrite').objectStore(storeName).put(data)
    res.onsuccess = onSuccess
    res.onerror = onError
}

function loadData({ id, onSuccess, onError }) {
    const transaction = db.transaction([storeName])
    const res = transaction.objectStore(storeName).get(id)
    res.onsuccess = () => {
        onSuccess(res)
    }
    transaction.onerror = onError
}

function removeData({ id, onSuccess }) {
    const transaction = db.transaction([storeName], 'readwrite')
    const objectStore = transaction.objectStore(storeName)
    const res = objectStore.delete(id)
    res.onsuccess = onSuccess
}

function clearData() {
    const transaction = db.transaction([storeName], 'readwrite')
    const objectStore = transaction.objectStore(storeName)
    objectStore.clear()
}