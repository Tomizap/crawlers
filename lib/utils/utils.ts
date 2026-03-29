export function shuffleArray(array: any[]) {
    const arr = [...array]; // copie pour ne pas modifier l'original

    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        // swap
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}


// Utilitaire timeout réutilisable
export function withTimeout(promise: Promise<any>, ms: number, label = '') {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout ${ms}ms${label ? ' — ' + label : ''}`)), ms)
        )
    ])
}