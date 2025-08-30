"use strict";
class Helper {
    constructor(time, list = [], cancelRef) {
        this.time = parseInt(400/time);
        this.list = list;
        this.cancelRef = cancelRef;
        this.history = []; // keep snapshots for step-back
        window._algoHelper = this; // expose for global buttons
    }

    mark = async (index) => {
        this.list[index].setAttribute("class", "cell current");
    }

    markSpl = async (index) => {
        this.list[index].setAttribute("class", "cell min");
    }

    unmark = async (index) => {
        this.list[index].setAttribute("class", "cell");
    }
    
    pause = async(action = "") => {
        if (this.cancelRef && this.cancelRef.cancelled) throw new Error("cancelled");

        return new Promise(resolve => {
            const check = () => {
                if (stepControl.mode === "play") {
                    setTimeout(resolve, this.time);
                } else if (stepControl.mode === "pause") {
                    // stay paused
                    requestAnimationFrame(check);
                } else if (stepControl.mode === "step") {
                    stepControl.mode = "pause"; // step once then pause
                    setTimeout(resolve, this.time);
                }
            };
            check();
        });
    }

    compare = async (i, j) => {
        await this.pause(`Comparing ${i} and ${j}`);
        let v1 = Number(this.list[i].getAttribute("value"));
        let v2 = Number(this.list[j].getAttribute("value"));
        explanationBox.textContent = `Comparing index ${i} (${v1}) and ${j} (${v2}) → ${v1 > v2 ? "swap" : "ok"}`;
        return v1 > v2;
    }

    swap = async (i, j) => {
        await this.pause(`Swapping ${i} and ${j}`);
        this.saveState(); // keep snapshot
        let v1 = this.list[i].getAttribute("value");
        let v2 = this.list[j].getAttribute("value");
        this.list[i].setAttribute("value", v2);
        this.list[i].style.height = `${3.8*v2}px`;
        this.list[j].setAttribute("value", v1);
        this.list[j].style.height = `${3.8*v1}px`;
        explanationBox.textContent = `Swapped index ${i} (${v1}) and ${j} (${v2})`;
    }

    saveState = () => {
        const snapshot = [...this.list].map(el => el.getAttribute("value"));
        this.history.push(snapshot);
    }

    stepBack = () => {
        if (this.history.length === 0) return;
        const prev = this.history.pop();
        this.list.forEach((el, idx) => {
            let v = prev[idx];
            el.setAttribute("value", v);
            el.style.height = `${3.8*v}px`;
        });
        explanationBox.textContent = "⏮ Step back";
    }
};
