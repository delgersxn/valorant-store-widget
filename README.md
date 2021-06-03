# VALORANT Store Widget

![](assets/cover_image.png)

## What's this?
This is simply a [Scriptable](https://apps.apple.com/us/app/scriptable/id1405459188) widget that allows for someone to view their in-game VALORANT store offers from their iOS device, all without the hassle of having to be at your computer and starting the game up.

## Benefit Over Others
The major benefit of using this script and approach is unlike some other services out there (Websites/Discord Bots), you can be 100% certain that your login credentials aren't being stolen or stored in a database somewhere. This is due to the script being run directly from **YOUR** iOS device giving you full control.

## Instructions.
#### **NOTE**
Apple widgets sadly update/refresh randomly and the time at which they do varies between some factors related to the iOS device, [more information](https://developer.apple.com/documentation/widgetkit/keeping-a-widget-up-to-date). If you'd like to see the shop the moment it updates I recommend setting it up so that Scriptable sends you a notification at the same time as the in-game shop updates. I show how to set up the notification in the Video Setup Guide.

### Option 01:
1. Install [Scriptable](https://apps.apple.com/us/app/scriptable/id1405459188) from the App Store.
2. Copy ```valorant_store.js``` into your Scriptable folder which is located inside of the iCloud Drive folder.
    The directory should look like this after:
    ```
    iCloud Drive/
    ├─ Scriptable/
    │  ├─ valorant_store.js
    ```
3. Launch Scriptable and confirm that ```valorant_store``` is listed in the Scripts view.
4. Configure the script with your Riot Account Region, Username and Password.
5. Press the run button on the top right to confirm the script is running correctly.
6. Go to your home screen and add a new Scriptable widget of your size.
7. Edit the Scriptable widget and choose the ```valorant_store``` as the script to run.
8. Done!

### Option 02:
1. Install [Scriptable](https://apps.apple.com/us/app/scriptable/id1405459188) from the App Store.
2. Open this GitHub repository from your phone through a browser.
3. Open the ```valorant_store.js``` file.
4. Click the three (3) dots on top of the file and press "View raw".
5. Now hold down on the page and select and copy EVERYTHING.
6. Open Scriptable, go to the Scripts tab and press the "+" button on the top right.
7. From here paste everything you copied into the text editor.
8. Configure/Edit the script with your Riot Account Region, Username and Password.
9. Press the run button on the top right to confirm the script is running correctly.
10. Press the top where it says "Untitled Script" and rename it to whatever you want.
11. Go to your home screen and add a new Scriptable widget of your size.
12. Edit the Scriptable widget and choose the ```valorant_store``` as the script to run.
13. Done!

### Video Setup Guide.

### Things To Do/Add.
- Add the price of each bundle and skin to the widget. 
    - This is a very easy task to complete and I have the code written already. The issue at the moment is the required API endpoint that gives the prices of each bundle/skin is getting rejected when run through Scriptable for some odd reason, so I will have to do some digging into it.
- Update the UI of the widget(s) to look better.
