'use strict';

navigator.mediaDevices.getUserMedia({
  audio: {
    mandatory: {
      chromeMediaSource: 'desktop'
    }
  },

  // We only want audio, but doesnt seem to work with video:false
  video: {
    mandatory: {
      chromeMediaSource: 'desktop'
    }
  }
}).then((localMediaStream) => {
  // Following taken from
  // https://medium.com/@gg_gina/how-to-music-visualizer-web-audio-api-aa007f4ea525

  const canvas = document.getElementById('canvas');

  // /////// <CANVAS> INITIALIZATION //////////
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  // /////////////////////////////////////////

  const context = new AudioContext(); // (Interface) Audio-processing graph

  const src = context.createMediaStreamSource(localMediaStream); // Give the audio context an audio source,
  // to which can then be played and manipulated
  const analyser = context.createAnalyser(); // Create an analyser for the audio context

  src.connect(analyser); // Connects the audio context source to the analyser
  // analyser.connect(context.destination); // End destination of an audio graph in a given context

  // ///////////// ANALYSER FFTSIZE ////////////////////////
  // analyser.fftSize = 32;
  // analyser.fftSize = 64;
  // analyser.fftSize = 128;
  // analyser.fftSize = 256;
  // analyser.fftSize = 512;
  // analyser.fftSize = 1024;
  // analyser.fftSize = 2048;
  // analyser.fftSize = 4096;
  // analyser.fftSize = 8192;
  analyser.fftSize = 16384;

  // analyser.fftSize = 32768;

  // (FFT) is an algorithm that samples a signal over a period of time
  // and divides it into its frequency components (single sinusoidal oscillations).
  // It separates the mixed signals and shows what frequency is a violent vibration.

  // (FFTSize) represents the window size in samples that is used when performing a FFT

  // Lower the size, the less bars (but wider in size)
  // /////////////////////////////////////////////////////////

  const bufferLength = analyser.frequencyBinCount; // (read-only property)
  // Unsigned integer, half of fftSize (so in this case, bufferLength = 8192)
  // Equates to number of data values you have to play with for the visualization

  // The FFT size defines the number of bins used for dividing the window into equal strips, or bins.
  // Hence, a bin is a spectrum sample, and defines the frequency resolution of the window.

  const dataArray = new Uint8Array(bufferLength); // Converts to 8-bit unsigned integer array
  // At this point dataArray is an array with length of bufferLength but no values

  const bars = 160; // Set total number of bars you want per frame
  const spacing = 10;
  const width = canvas.width;
  const height = canvas.height;
  const barWidth = width / bufferLength * 13;
  const start = performance.now();
  let counter = 0;

  console.log({
    width,
    height,
    barWidth,
    bufferLength,
    totalWidth: bars * spacing + bars * barWidth
  });
  let barHeight;
  let x = 0;

  const renderFrame = (timestamp) => {
    x = 0;
    analyser.getByteFrequencyData(dataArray);
    // Copies the frequency data into dataArray
    // Results in a normalized array of values between 0 and 255
    // Before this step, dataArray's values are all zeros (but with length of 8192)

    counter += 1;
    if (counter % 10 === 0) {
      console.log(`${Math.round(counter / ((timestamp - start) / 1000))}fps, lag: ${Math.round(((performance.now() - timestamp) + Number.EPSILON) * 100) / 100}ms`, dataArray);
    }

    ctx.fillStyle = 'rgba(0,0,0,0.2)'; // Clears canvas before rendering bars (black with opacity 0.2)
    ctx.fillRect(0, 0, width, height); // Fade effect, set opacity to 1 for sharper rendering of bars

    let r;
    let g;
    let b;

    for (let i = 0; i < bars; i += 1) {
      barHeight = dataArray[i] * 2.5;

      if (dataArray[i] > 210) { // pink
        r = 250;
        g = 0;
        b = 255;
      } else if (dataArray[i] > 200) { // yellow
        r = 250;
        g = 255;
        b = 0;
      } else if (dataArray[i] > 190) { // yellow/green
        r = 204;
        g = 255;
        b = 0;
      } else if (dataArray[i] > 180) { // blue/green
        r = 0;
        g = 219;
        b = 131;
      } else { // light blue
        r = 0;
        g = 199;
        b = 255;
      }

      // if (i === 0) {
      //   console.log(`rgb(${r},${g},${b}) `, dataArray);
      // }

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);

      x += barWidth + spacing; // Gives 10px space between each bar
    }
  };

  renderFrame();
  setInterval(() => requestAnimationFrame(renderFrame), 40);
}).catch((e) => {
  console.log('Error', e);
});

