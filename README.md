# Digipen CSD3120 IPA-PartB

This is my test bed for my IPA project part A/B.

## How To Build
Required files: index.html, script.js, sphere-collider.js. As for assets, they are being hosted on Glitch so unfortunately it can't be built locally due to CORS policy restrictions.
Meanwhile, try out the app [here](https://csd3120-chemical-reactions.glitch.me/)!. 

## Video Showcase
Clicking the following video redirects to youtube OR [https://youtu.be/iVQr28Ewdes](https://youtu.be/iVQr28Ewdes)
[![youtube](https://cdn.glitch.global/3e303cbd-aded-4458-9dbd-58742f67fa57/Screenshot%202023-03-20%20024037.jpg?v=1679251560805)](https://youtu.be/iVQr28Ewdes)

## Longish Summary

![alt text](https://cdn.glitch.global/3e303cbd-aded-4458-9dbd-58742f67fa57/Screenshot%202023-03-18%20115828.jpg?v=1679246415736)
So for this IPA part B I tried to do something strange and I am not sure if I will get penalized or what for it. Basically the idea is that while trying
to fulfill the rubrics and requirements, I realized that things get a little difficult (and boring) trying to test basic features. My idea was to
use AR to capture some form of user input, like hand gestures or motions.

I did a little research and found multiple sources of web based realtime finger tracking which uses ML, however many of these solutions were either not open source
or required a lot of setup, like importing few megabytes worth of models. Some of these solutions include [MediaPipe](https://google.github.io/mediapipe/), [Handtrack.js](https://victordibia.com/handtrack.js/#/), among others.

I eventually settled on the idea of using [AR.js](https://ar-js-org.github.io/AR.js-Docs/) which is both open source as well as closely similar to what XRAuthor uses as the QR codes share some ressemblence.
My idea was to create a pseudo VR controller (that didn't cost me a few hundred) using QR codes that would allow me to control objects in a VR environment.

Prototype:

![alt text](https://cdn.glitch.global/3e303cbd-aded-4458-9dbd-58742f67fa57/pseudo_controller.jpeg?v=1679247258413)

The 2 QR codes on the "controller" corresponds to barcode 0 (the big one) and barcode 1 (the small one) of the AR.js library. The idea is that barcode 0
will be used to display the visuals of the controller, in this case an open/closed hand while barcode 1 be used as a "button". Since AR.js has marker events
linked to whether or not a marker is in view, I can use that to trigger my own events in the VR world.

![alt text](https://cdn.glitch.global/3e303cbd-aded-4458-9dbd-58742f67fa57/Screenshot%202023-03-20%20013811.jpg?v=1679247533465)

Thats it basically, after I managed to get the model and events working, the rest was relatively the same as usual AFrame shenanigans.

## Why no environment? (Setbacks)

While trying to use both an AR.js embedded scene in tendem with a normal AFrame scene with many AFrame a-entity(s), I experienced a huge performance hit (i.e. the fps dropped to single digits).
After much debugging, I managed to discover that it was due to the fact that AR.js renders to the entire html body/scene by default, however that itself was not the issue.
The real issue I think is because of the way AFrame renders while using the logarithmic depth test which AR.js requires.

When AR.js renders the entire camera feed onto the scene, I believe that all values in the depth buffer are filled up, and when the default scene renders on top of it
with huge occluding objects like walls/skybox, each pixel will have to do a logarithmic check with the depth buffer in the shader. After theorizing this, I tried many ways
to fix it, such as trying to disable the live video render, clearing the depth buffer in between the AR/VR render, disabling depth buffer test, but could not find
the ways to do so as maybe AFrame's renderer was too high level and not robust enough. Ultimately, I found that the best solution was to remove these huge occluding objects,
like the classroom walls, and the skybox. This greatly increased my fps from single digits to a stable 50-60 fps, 100 on a good day for my laptop. That is why the I have no classroom model and no skybox.

## What I would change or improve

I realize that wrapping the QR codes in shiny tape doesn't do it any favors as light reflection can prevent recognition of the marker. I think its also possible to create a 360 degree controller using QR codes that can be recognized from any orientation. Of course the best would be to have a stable and reliable 
hand tracking model to replicate hand interaction in the virtual world.

## Conclusion
If you like what I did please consider me as a summer intern!