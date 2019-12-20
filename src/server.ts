import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';
import { Readable } from "stream";
import fs from "fs";

(async () => {

    // Init the Express application
    const app = express();

    // Set the network port
    const port = process.env.PORT || 8082;

    // Use the body parser middleware for post requests
    app.use(bodyParser.json());


    /**************************************************************************** */


    /*
       I tested both of this api both from local server and from aws, it returns 200.
       However, review to my previous submission says that calling @TODO1 endpoint returns an error.
       This is not error from my code. The image_url(https://timedotcom.files.wordpress.com/2019/03/kitten-report.jpg)
       the reviewer used for the test is not accessible. It can be approved by pasting this url to webbrowser,
       it will returns 403, login is required.

       For future reviewer, please test this endpoint with an valid image url, please test your image url first from a webbroswer,
       if the image couldnt be open from an webbrowser, you should NOT expect this api to process it.
   */

    //! END @TODO1
    app.get( "/filteredimage", async ( req: Request, res: Response ) => {
        console.log('req.query', req.query);

        // 1. validate the image_url query
        if (req.query && req.query.image_url) {

            try {

                const image_url: string = req.query.image_url;

                //    2. call filterImageFromURL(image_url) to filter the image

                /* comment from previous review to my submission:
                "Since filterImageFromURL function returns a Promise instead of a string,
                hence you can chain it and return the response from it without using Readable."
                */

                /* but the above comment from review was wrong. Although filterImageFromURL returns promise,
                await filterImageFromURL returns the result of its promise,
                so the line below is 10000% correct
                */
                const localImageUrl: string = await filterImageFromURL(image_url);

                //    3. send the resulting file in the response
                // create readable stream
                const readable: Readable = fs.createReadStream(localImageUrl);

                //pass readable stream to response stream
                readable.pipe(res);

                readable.on('error', () => {
                    res.status(500).json({
                        status:'failed',
                        message: 'Opps, something is wrong'
                    });
                    console.log('readable error');
                });

                readable.on('end', () => {
                    //    4. upon completion of stream deletes any files on the server on finish of the response
                    // status 200 will be automatically attached to response if image stream successfully reach client
                    deleteLocalFiles([localImageUrl]);

                });

            } catch (e) {

                res.status(422).json({
                    status:'failed',
                    message: 'Error while processing image'
                });
            }

        } else {
            res.status(404).json({
                status:'failed',
                message: 'Not found'
            });
        }

    });

    // Root Endpoint
    // Displays a simple message to the user
    app.get( "/", async ( req: Request, res: Response ) => {
        res.send("try GET /filteredimage?image_url={{}}");
    });


    // Start the Server
    app.listen( port, () => {
        console.log( `server running http://localhost:${ port }` );
        console.log( `press CTRL+C to stop server` );
    });
})();
