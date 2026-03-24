// utils/konami.ts
const KONAMI_CODE = ['x', 'y', 'z', 'n', 'd', 'e', 'v']

let inputSequence: string[] = []

export default (callback: () => void) => {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
        console.log(e.key)
        inputSequence.push(e.key.toLowerCase())
        inputSequence = inputSequence.slice(-10)

        if (inputSequence.join(',') === KONAMI_CODE.join(',')) {
            console.log('success')
            callback()
            inputSequence = []
        }
    })
}
