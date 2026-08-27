export function forceGC() {
    if (typeof global.gc === "function") {
        global.gc();
        console.log("🧹 Garbage collection forced");
    } else {
        console.warn("⚠️ GC is not exposed");
    }
}

export function getMemory() {
    const memory = process.memoryUsage();

    return {
        rss: memory.rss,
        heapUsed: memory.heapUsed,
        heapTotal: memory.heapTotal,
        external: memory.external,
        arrayBuffers: memory.arrayBuffers,
    };
}

export function logMemory(label = "Memory") {
    const memory = getMemory();

    console.log(`🧠 ${label}`);
    console.log(
        `RSS: ${(memory.rss / 1024 / 1024).toFixed(2)} MB`
    );
    console.log(
        `Heap Used: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`
    );
    console.log(
        `Heap Total: ${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`
    );
}