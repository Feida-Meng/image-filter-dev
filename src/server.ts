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

    // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
    // GET /filteredimage?image_url={{URL}}
    // endpoint to filter an image from a public url.
    // IT SHOULD
    //    1
    //    2. call filterImageFromURL(image_url) to filter the image
    //    3. send the resulting file in the response
    //    4. deletes any files on the server on finish of the response
    // QUERY PARAMATERS
    //    image_url: URL of a publicly accessible image
    // RETURNS
    //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

    /**************************************************************************** */

    //! END @TODO1
    app.get( "/filteredimage", async ( req: Request, res: Response ) => {
        console.log('req.query', req.query);

        // 1. validate the image_url query
        if (req.query && req.query.image_url) {

            try {
                //    2. call filterImageFromURL(image_url) to filter the image
                const localimageUrl: string = await filterImageFromURL(req.query.image_url);

                //    3. send the resulting file in the response
                // create readable
                const readable: Readable = fs.createReadStream(localimageUrl);

                //pass readable stream to response
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
                    deleteLocalFiles([localimageUrl]);

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