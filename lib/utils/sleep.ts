export async function sleep(ms = 1000) { return new Promise(resolve => setTimeout(resolve, ms)); }
export async function sleepRandom(min = 1000, max = 3000) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return await sleep(delay)
}