// ==UserScript==
// @name         streak.club audio volume slider
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://streak.club/s/*
// @grant        none
// @run-at       document-start
// @include      http*://streak.club/s/*
// @updateURL    https://raw.githubusercontent.com/torcado194/userScripts/master/streakclub_volumeSlider.js
// @downloadURL  https://raw.githubusercontent.com/torcado194/userScripts/master/streakclub_volumeSlider.js
// ==/UserScript==

(function() {
    'use strict';
    let config = {attributes: true, childList: true, subtree: true};

    let observer = new MutationObserver(function(mutationsList, observer){
        for(let mutation of mutationsList){
            if(mutation.type === 'childList'){
                if(mutation.addedNodes.length > 0 && mutation.addedNodes[0]){
                    if(mutation.addedNodes[0].classList.contains('audio_sticky_player')){
                        addSlider(mutation.addedNodes[0]);
                    }
                } else if(mutation.removedNodes.length > 0 && mutation.removedNodes[0]){
                    if(mutation.removedNodes[0].classList.contains('audio_sticky_player')){
                        removeSlider(mutation.addedNodes[0]);
                    }
                }
            }
        }
    });

    observer.observe(document.getElementsByClassName('audio_track_list_drop')[0], config);

    if(!localStorage.getItem('torc_volume')){
        localStorage.setItem('torc_volume', 0.5);
    }

    const sliderTemplate = document.createElement('template');
    sliderTemplate.innerHTML = `
<div class="torc_streakclubVolumeContainer">
    <input class="torc_streakclubVolumeInput" type="range" max="1" step="0.01" min="0">
</div>
`;
    const sliderEl = sliderTemplate.content.firstElementChild;

    function addSlider(el){
        getAudioEl(el).then(audioEl => {
            let slider = el.appendChild(sliderEl),
                input = slider.children[0],
                savedVolume = localStorage.getItem('torc_volume');
            audioEl.volume = savedVolume;
            input.value = savedVolume;
            input.addEventListener('input', function(e){
                audioEl.volume = this.value;
                localStorage.setItem('torc_volume', this.value);
            });
        }).catch(console.error);
    }

    function removeSlider(el){

    }

    function getAudioEl(el){
        return new Promise((resolve, reject) => {
            let fiberNode;
            for(let key in el) {
                if(key.startsWith('__reactInternalInstance$')){
                    fiberNode = el[key];
                    break;
                }
            }
            let startTime = Date.now()
            let probeIntvl = setInterval(()=>{
                //console.log('check...');
                let n = fiberNode.return.stateNode.props.audio_files[0];
                if(n && n.state && n.state.audio){
                    clearInterval(probeIntvl);
                    return resolve(n.state.audio);
                }
                if(Date.now() - startTime > 1000 * 30){ //30 seconds
                    return reject('could not pull audio element');
                }
            }, 10);
        });
    }


    function addCSS(css){
        let head = document.getElementsByTagName('head')[0] || document.getElementsByTagName('html')[0];
        if (!head) {
            return;
        }
        let style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        head.appendChild(style);
    }

    addCSS(`

.torc_streakclubVolumeContainer {
  margin-top: -4px;
}

input[type=range] {
  -webkit-appearance: none;
  width: 100%;
  background: transparent;
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
}

input[type=range]:focus {
  outline: none;
}

input[type=range]::-ms-track {
  width: 100%;
  cursor: pointer;

  background: transparent;
  border-color: transparent;
  color: transparent;
}

input[type=range]::-webkit-slider-thumb {
  border: 1px solid #999;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  margin-top: -9px;
}

input[type=range]::-moz-range-thumb {
  border: 1px solid #999;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  margin-top: -10px;
}

input[type=range]::-ms-thumb {
  border: 1px solid #999;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  margin-top: -10px;
}

input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 5px;
  cursor: pointer;
  background: #fff;
  border-radius: 5px;
  background: #bbb;
  border: 1px solid #aaa;
}

input[type=range]::-moz-range-track {
  width: 100%;
  height: 5px;
  cursor: pointer;
  background: #fff;
  border-radius: 5px;
  background: #bbb;
  border: 1px solid #aaa;
}

input[type=range]::-ms-track {
  width: 100%;
  height: 5px;
  cursor: pointer;
  background: #fff;
  border-radius: 5px;
  background: #bbb;
  border: 1px solid #aaa;
}
`);

})();