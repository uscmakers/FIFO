# FIFO — Smart Fridge System

FIFO (First In First Out) is an attachable smart fridge system designed to **reduce household food waste** through automated inventory tracking and gamified reminders.

Developed by an **8-person engineering team at USC Makers**, FIFO combines computer vision, a vision-language model, barcode scanning, sensors, and a shared database to track food entering and leaving the fridge.

The system is paired with a **Unity/C# companion app** that visualizes expiration dates and uses streak tracking and avatar customization to encourage users to reduce food waste.

## Technology

**Machine Learning & Computer Vision:** Python, Detectron2, OpenCV, Google PaliGemma VLM, Roboflow, COCO

**Game & Mobile:** Unity, C#, React Native, Figma

**Backend & APIs:** Firebase (Firestore + Authentication), Flask, OpenFoodFacts, Gemini, ngrok

**Hardware & Communication:** Raspberry Pi Camera, Ultrasonic Sensor, NEMA 14 Stepper Motor, MQTT

**Infrastructure:** Cloud GPU

## Hardware System

FIFO uses an **RPi camera and ultrasonic sensor** to capture fridge activity, with a stepper-motor-driven system that moves the camera across the fridge. MQTT communication synchronizes the electrical subcomponents.

The mechanical assembly uses a **3D-printed camera movement system** with a timing belt, gears, guide rod, and linear bearings, along with an attachable LCD screen mount and battery pack holder.
