# Pillow Paws artwork

Generated with the built-in image generation tool. The user's reference images and screen recording were not available in this chat, so the golden retriever and cockapoo are provisional characters, not claimed recreations of the user's dogs. Replace the base render and update the four normalized eye rectangles when references are supplied.

## Layers

- `dist/assets/dogs-base.png`: original transparent 1536 × 1024 generated stationary character plate, including blank eye whites.
- Four `.sclera` layers: separate stationary shaded eye surfaces, clipped to the generated sockets.
- `dist/assets/pupil.svg`: independent glossy iris/pupil artwork, instanced four times. Only these instances translate, with an elliptical bound of 12% eye width and 8.5% eye height, eased with a 105ms response.
- Four `.eyelid` layers: isolated eye-local blink masks. No dog head, ear, body or paw animation.

Idle glances and blinking pause when the document is hidden, with an explicit pause control and full support for `prefers-reduced-motion`. Touch movement does not drive the pupils. No continuous animation frame runs after the eyes settle.

## Final generation prompt

+Use case: stylized-concept.
Asset type: transparent 3D character artwork for a premium dog hotel landing page, provisional characters because the user's reference attachments are missing.
Primary request: Two delightful dogs SIDE BY SIDE, seen directly from the front, welcoming visitors as they peek over an invisible horizontal ledge. Left a soft honey golden retriever with floppy ears, fluffy cheeks, broad black nose and a calm happy open mouth, little pink tongue. Right a smaller creamy apricot cockapoo with fluffy curly fur, floppy ears, dark brown nose, playful happy small open mouth. Friendly rounded beautiful high end 3D animated feature film character rendering, tactile soft groomed fur, warm ivory and sandy golden colors. Soft studio lighting from upper left, ambient occlusion, polished but very soft cozy plush appearance, no hard plastic.
Composition: landscape 3:2 transparent canvas. Dogs together fill nearly the whole frame with narrow transparent margin. Heads large, at similar height, ears fully visible. Upper chests visible. FOUR front paws total, two per dog, all rest over the SAME invisible horizontal edge near the bottom. Paws seen hanging over the edge, toes facing camera. No actual ledge or background. Both perfectly frontal, symmetrical eye positions, stationary pose. Not tilted. Separate silhouettes must be clearly readable, no overlapping faces.
CRITICAL FOR ANIMATION: ALL FOUR EYES must be pupil-free and iris-free. Each eye has a clearly defined rounded almond-shaped socket, dark thin rim and smooth warm ivory eyeball; leave all eye whites completely blank so separately composited pupils can be added in code. No black pupil, no iris, no eye highlight painted in the blank white. Maintain charming expression through cheeks and smile. Eye whites should be moderately large and proportional, suitable for subtle pupil animation.
Constraints: exactly two dogs, four eyes, four front paws. No text, no lettering, no props, no collars, no floor, no ledge, no shadow rectangle. Real alpha transparent background. Keep entire characters including paws and ears in frame.
