import { ref } from 'vue'

export function useEmulatorDB() {
    const db = ref<IDBDatabase | null>(null)

    async function initDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('NESEmulator', 1)

            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve(request.result)

            request.onupgradeneeded = () => {
                const database = request.result

                // 创建存档表
                if (!database.objectStoreNames.contains('saves')) {
                    const saveStore = database.createObjectStore('saves', { keyPath: 'id' })
                    saveStore.createIndex('game', 'game', { unique: false })
                }

                // 创建设置表
                if (!database.objectStoreNames.contains('settings')) {
                    database.createObjectStore('settings', { keyPath: 'key' })
                }

                // 创建金手指表
                if (!database.objectStoreNames.contains('cheats')) {
                    const cheatStore = database.createObjectStore('cheats', { keyPath: 'id' })
                    cheatStore.createIndex('game', 'game', { unique: false })
                }
            }
        })
    }

    async function saveToIndexedDB(storeName: string, data: any): Promise<IDBRequest> {
        if (!db.value) throw new Error('Database not initialized')

        const transaction = db.value.transaction([storeName], 'readwrite')
        const store = transaction.objectStore(storeName)

        return store.put(data)
    }

    async function loadFromIndexedDB(storeName: string, key: string): Promise<any> {
        if (!db.value) throw new Error('Database not initialized')

        const transaction = db.value.transaction([storeName], 'readonly')
        const store = transaction.objectStore(storeName)

        return new Promise((resolve, reject) => {
            const request = store.get(key)
            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
        })
    }

    async function getAllFromIndexedDB(
        storeName: string,
        indexName?: string,
        indexValue?: string,
    ): Promise<any[]> {
        if (!db.value) throw new Error('Database not initialized')

        const transaction = db.value.transaction([storeName], 'readonly')
        const store = transaction.objectStore(storeName)

        return new Promise((resolve, reject) => {
            let request: IDBRequest

            if (indexName && indexValue) {
                const index = store.index(indexName)
                request = index.getAll(indexValue)
            }
            else {
                request = store.getAll()
            }

            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
        })
    }

    async function deleteFromIndexedDB(storeName: string, key: string): Promise<void> {
        if (!db.value) throw new Error('Database not initialized')

        const transaction = db.value.transaction([storeName], 'readwrite')
        const store = transaction.objectStore(storeName)

        return new Promise((resolve, reject) => {
            const request = store.delete(key)
            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
        })
    }

    return {
        db,
        initDB,
        saveToIndexedDB,
        loadFromIndexedDB,
        getAllFromIndexedDB,
        deleteFromIndexedDB,
    }
}
