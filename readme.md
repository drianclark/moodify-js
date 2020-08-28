# Idea: to develop a web application that essentially utilises a user's Spotify listening history as a mood tracker (of sorts)

## Spotify's API provides various information about each track. Among these is a 'valence' rating, or more aptly, a 'happiness' rating. The idea is to use this, along with a user's listening history, to create some sort of mood tracker.

There are three different services running on separate Docker containers (backend, database, and the track update service). The front-end is made with Vue JS, the backend with Flask in Python, and MYSQL is used for the database. 

Spotify's API only provides the 50 most recently played tracks, so the track update service and database are used to store tracks beyond this limit. The tracks update service runs at regular intervals and calls the Spotify API to request the 50 recently played tracks. It then stores the tracks that have not been stored yet in the database. 

The project has been deployed to a Google Cloud Platform Compute Engine.
 
## Images

![Overview of mood tracker][overview]
*Mood tracker overview*

![Mood tracker tooltips][tooltips]
*Mood tracker tooltip*

[overview]: ./spotify-mood-tracker-js-overview.png
[tooltips]: ./spotify-mood-tracker-js-tooltip.png

---

## Possible improvements

1. At the moment, the mood tracker can only display the valence rating per track. It would be good to be able to display the average valence per day in order to represent the changes in mood per day over a week, for example.

1. Spotify's valence rating (at least for me) is not accurate at all. It would be a good idea to be able to change valence ratings for tracks in some way or another. This could be done in an ad-hoc manner via the front-end and have the new valence stored in the database or through creating a new valence rating altogether for all tracks as a function of their other attributes also provided by the API (acousticness, tempo, speechiness, etc).

