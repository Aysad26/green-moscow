// Keep the loader until actual downloads, fonts and GPU preparation finish.
const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(resolve => window.addEventListener('load', resolve, {once:true}));
const images = [...document.images].map(img => {
  img.loading = 'eager';
  if (img.decode) return img.decode().catch(() => {});
  return img.complete ? Promise.resolve() : new Promise(resolve => {img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});});
});
const fonts = document.fonts ? Promise.all([400,500,600].map(weight => document.fonts.load(`${weight} 16px "Golos Text"`))).then(() => document.fonts.ready) : Promise.resolve();
window.woodResourcesReady = Promise.allSettled([loaded,fonts,...images]);
import('./app.js?v=wooden-loader-6').catch(async error => {
  await window.woodResourcesReady;
  console.warn('City module unavailable:',error);
  document.documentElement.classList.remove('is-loading');
  document.getElementById('loader').hidden=true;
  document.getElementById('scene-stage').classList.add('scene-has-error');
  document.querySelectorAll('[data-replay]').forEach(button => button.hidden=true);
});
