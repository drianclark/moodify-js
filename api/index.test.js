const app = require('./index');
const supertest = require('supertest');
const path = require('path');
const sqlite3 = require('sqlite3');
const moment = require('moment');

const request = supertest(app.main);
const dbName = './sqlite-db/test.db';

const dbPath = path.resolve(__dirname, dbName);

const db = new sqlite3.Database(dbPath, err => {
    if (err) {
        console.log(dbPath);
        console.log(err.message);
    }
});

beforeAll(() => {
    return new Promise((resolve, reject) => {
        // Delete all tracks
        const truncateSQL = 'DELETE FROM tracks;';
        db.serialize(() => {
            db.run(truncateSQL, err => {
                if (err) {
                    console.error(err.message);
                    reject('Error truncating table');
                }
            });
        });

        // Insert two tracks
        const placeholders = [0, 1]
            .map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)')
            .join(', ');
        const populateSQL =
            'INSERT INTO tracks (spotifyid, title, play_date, valence, acousticness, danceability, energy, speechiness, tempo) VALUES ' +
            placeholders;

        const track1 = [
            '4OT8GH9u9Gx7ydJ49ULunN',
            'Slow Dancing in a Burning Room - Live at the Nokia Theatre, Los Angeles, CA - December 2007',
            '2020-02-13 13:47:15.000',
            0.451,
            0.2,
            0.514,
            0.536,
            0.0288,
            133.848
        ];

        const track2 = [
            '2k9N4caeCIJLOWwWwssrEM',
            'Easily',
            '2020-02-13 13:05:24.000',
            0.357,
            0.491,
            0.772,
            0.256,
            0.0481,
            118.902
        ];

        const tracks = [track1, track2].flat();

        db.serialize(() => {
            db.run(populateSQL, tracks, err => {
                if (err) {
                    console.error(err.message);
                    reject('Error populating table');
                } else resolve('successfully updated db');
            });
        });
    });
});

afterAll(() => {
    const truncateSQL = 'DELETE FROM tracks;';
    db.serialize(() => {
        db.run(truncateSQL, err => {
            if (err) {
                console.error(err.message);
            }
        });
        db.close();
    });
});

test('get latest db date working', async () => {
    const expectedLatestDBDate = moment('2020-02-13 13:47:15.000');
    const latestDBDate = await app.get_latest_db_date();

    expect(expectedLatestDBDate).toEqual(latestDBDate);
});

test('tracks update working', async () => {
    // trigger db update
    const response = await request.get('/api/update_tracks');

    console.log('done with db update');
    // we get the recently played tracks from the spotify API
    const recentTracks = await app.get_recently_played_tracks();

    // we check whether all of the tracks we recently played
    // were all added to the database
    const query = `SELECT * FROM tracks ORDER BY play_date DESC LIMIT 50;`;
    var dbTracks = [];

    db.serialize(() => {
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error(err.message);
            } else {
                rows.forEach(row => {
                    let trackArray = Object.values(row).slice(1);
                    let valence = trackArray[2];
                    let date = trackArray[3];
                    // swapping date and valence order in the array
                    trackArray[2] = date;
                    trackArray[3] = valence;
                    dbTracks.push(trackArray);
                });
                expect(recentTracks).toEqual(dbTracks);
            }
        });
    });
});
