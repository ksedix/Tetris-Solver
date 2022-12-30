# Tetris AI
A graphical interface for Tetris that contains an AI and a genetic tuner for the AI. You can also play it yourself.

## Live Webpage
The live webpage containing the graphical interface can be found [here](http://leeyiyuan.github.io/tetrisai).

## Tuning
To tune, open up the Developer Console in the web browser and run the command `new Tuner().tune();`.

## License
Copyright (C) 2014 - 2017 [Yiyuan Lee](https://leeyiyuan.info)
[MIT License](https://github.com/LeeYiyuan/tetrisai/blob/gh-pages/License.md)

## Story behind the Mod

I was trying to win free fuel from the ingo app by getting a highscore on their tetris game. As such, I needed a way to find a tetris solver which was not as easy as you would think. You would think that because tetris is a popular game, it would be easy to find a tetris solver online. But it was not. However, after a lot of searching, I finally found a tetris solver that worked perfectly, created by Lee Yiyuan. The only problem was that this tetris solver generated all of the pieces randomly that it solved for. I needed to be able to tell the tetris solver which piece it should solve for. This was because the tetris solver needed to solve the pieces that were being displayed in the tetris game on ingo phone app. Below is a screenshot of the tetris game on the ingo phone app.    
<img src="https://user-images.githubusercontent.com/76788207/210077796-444d8590-922f-43ea-bc9e-d09e56fbd8a2.jpg" alt="Ingo tetris game" width=300px>  
People with highscore on this tetris game receive a reward of up to 50 litres free fuel. And that's how I came up with the idea for this Mod.   
<img src="https://user-images.githubusercontent.com/76788207/210077800-441a6bbe-b80a-4f51-ba51-f815b0c56b85.jpg" alt="Ingo tetris game scoreboard" width=300px>

## Demo

The mod works by asking the player for the starting piece and then for the next piece at the beginning of the game. The user is asked in the form of a windows prompt field.  
![select_starting_piece](https://user-images.githubusercontent.com/76788207/210079022-28778db7-be71-4be1-862d-35cc94d0e1ae.png)   
The valid pieces are 'i','j','l','o','s' and 'z'. The letters correspond to the look of each piece.   
![ITOLJSZ](https://user-images.githubusercontent.com/76788207/210078817-30d3b781-2742-46e7-b6de-a48950cda18e.jpg)

The game continues by asking the player for the next piece each time a piece hits the ground.   
<img src="https://user-images.githubusercontent.com/76788207/210079828-f9a3cd29-7652-4d48-a43d-d34f6232bf74.png" alt="Tetris piece hits ground" width=440px>
