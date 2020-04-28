//get UI elements
import {fromEvent} from 'rxjs';
import {switchMap, map, pairwise, takeUntil, withLatestFrom, startWith} from 'rxjs/operators';

const canvas = document.querySelector('canvas');
const clearButton = document.getElementById('clear');
const saveButton = document.getElementById('save');
const colorSelector = document.getElementById('colorSelector');
const lineWeight = document.getElementById('lineWeight');
const lineWeightValue = document.getElementById('lineWeightValue');
const BACKGROUND_COLOR = '#123122';

let context = canvas.getContext('2d');
initCanvas();

// get event streams
const mouseUp$ = fromEvent(canvas, 'mouseup');
const mouseDown$ = fromEvent(canvas, 'mousedown');
const mouseMove$ = fromEvent(canvas, 'mousemove');
const mouseOut$ = fromEvent(canvas, 'mouseout');
const lineWeight$ = fromEvent(lineWeight, 'input').pipe(
    map(event => {
        lineWeightValue.innerHTML = 'Weight: ' +  event.target.value;
        return event.target.value
    }),
    startWith(lineWeight.value)
);
const colorSelector$ = fromEvent(colorSelector, 'input').pipe(
    map(event => event.target.value),
    startWith(colorSelector.value)
);


mouseDown$.pipe(
    withLatestFrom(lineWeight$, colorSelector$, (_, lineWeight, color) => {
        return {
            lineWeight,
            color
        }
    }),
    switchMap((options) => mouseMove$.pipe(
        map(event => {
            return {
                x: event.offsetX,
                y: event.offsetY,
                options: options
            }
        }),
        pairwise(),
        takeUntil(mouseUp$),
        takeUntil(mouseOut$)
    ))
).subscribe(([from, to]) => {
    const options = from.options;
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.strokeStyle = options.color;
    context.lineWidth = options.lineWeight;
    context.stroke();
});


// Button listeners
saveButton.addEventListener('click', () => {
    saveButton.setAttribute('href', canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream"));
    saveButton.setAttribute('download', 'picture.jpg')
});
clearButton.addEventListener('click', () => {
    clearCanvas();
});


function initCanvas() {
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio;

    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    context.fillStyle = BACKGROUND_COLOR;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.scale(scale, scale);
}

function clearCanvas() {
    context.clearRect(0,0,canvas.width, canvas.height);
    context.fillStyle = BACKGROUND_COLOR;
    context.fillRect(0, 0, canvas.width, canvas.height);
}