CREATE TABLE `tracks` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `spotifyid` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valence` float NOT NULL,
  `play_date` datetime NOT NULL,
  `acousticness` float NOT NULL,
  `danceability` float NOT NULL,
  `energy` float NOT NULL,
  `speechiness` float NOT NULL,
  `tempo` float NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=158 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;