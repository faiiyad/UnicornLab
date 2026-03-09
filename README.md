# 🦄 Unicorn Labs
## [DEMO](https://youtu.be/MH_l7Dm0jls?si=FacgrdCCjK8AAT6f)
### BACSA hacks 2026 closed track challenge

The unicorn will always find who did it - as long as you provide the data!

---

## How to use this app
- #### Step 1:
  Clone the repo.
- #### Step 2:
  In a terminal go to `backend` directory and run `pip install -r requirements.txt` (windows) or `pip3 install -r requirements.txt` (mac). 
- #### Step 3:
  In the `backend` directory, run `python result.py` (windows) or `python3 result.py` (mac). 
  The backend server should start at `localhost:8080`
- #### Step 4:
  Change the directory to `unicornlab` and run `npm install` in the terminal
- #### Step 5:
  In the `unicornlab` directory, run `npm run dev`. 
  The frontend server should start at `localhost:3000`
- #### Step 6:
  In a browser, open `localhost:3000` and start the investigation!

## How the app works:
#### Fingerprint:
The uploaded `.bmp` files first go through pre-processing to increase ridge detection and decrease noise. Then we use Lowe's ratio test and RANSAC homography to calculate the simillarity scores and normalize them.

#### DNA:
The upload `.fatsa` files are parsed, and then we use the Smith-Waterman local alignment method (N bases as wildcards) to calculate an accurate score and then normalize them.


