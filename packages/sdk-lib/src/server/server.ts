import isString from 'lodash/isString';
import express from 'express';
import cors from 'cors';
import http from 'http';
import socketIO from 'socket.io';
import * as rollupUmdApi from './rollup-umd-api';
import {readFile} from './fileUtils';
import {FileDescription} from '../types';
import {uploadSkin} from './uploadSkin';
import path from 'path';
import {DocumentClass_Index} from '@pancodex/domain-lib';

const clientSockets: any = {};

function readDocumentClassIndex(dataDirPath: string): DocumentClass_Index {
    const documentClassIndexData: FileDescription = readFile(path.join(dataDirPath, 'documentClassIndex.json'));
    let documentClassIndex: DocumentClass_Index = {};
    if (documentClassIndexData && documentClassIndexData.fileData) {
        try {
            documentClassIndex = JSON.parse(documentClassIndexData.fileData) as DocumentClass_Index;
        } catch (e: any) {
            console.error(`ERROR: fail to parse "documentClassIndex.json" file. Please run "yarn scaffold" or "npm run scaffold" before you start SDK server.`)
        }
    } else {
        console.error(`ERROR: fail to read "documentClassIndex.json" file. Please run "yarn scaffold" or "npm run scaffold" before you start SDK server.`)
    }
    return documentClassIndex;
}

function notifyClients(messageCode: string, arg?: {documentClassIndex: DocumentClass_Index}) {
    const clientSocketsIds = Object.keys(clientSockets);

    if (clientSocketsIds && clientSocketsIds.length > 0) {
        let clientSocket;
        clientSocketsIds.forEach(clientSocketId => {
            clientSocket = clientSockets[clientSocketId];
            if (clientSocket) {
                clientSocket.emit(messageCode, arg);
            }
        });
    }
}

const timeBundlingMessage = 'Bundle is built in';

export function runServer(options: { distDirPath: string, libDirPath: string; dataDirPath: string }) {
    if (!options) {
        throw Error('The data, dist and lib dirs paths are not specified in the options argument.');
    }
    const {distDirPath, libDirPath, dataDirPath} = options;
    if (!distDirPath || !libDirPath || !dataDirPath) {
        throw Error('The data, dist and lib dirs paths are not specified in the options argument.');
    }
    rollupUmdApi.watch((code, error) => {
        if (code === 'START') {
            console.log('Watcher is started');
        } else if (code === 'BUNDLE_START') {
            notifyClients('bundling_started');
            console.time(timeBundlingMessage);
        } else if (code === 'BUNDLE_END') {
            console.log('Bundling finished');
        } else if (code === 'END') {
            console.log('Bundling finished all');
            console.timeEnd(timeBundlingMessage);
            const documentClassIndex: DocumentClass_Index = readDocumentClassIndex(dataDirPath);
            notifyClients('bundling_finished', {documentClassIndex});
        } else if (code === 'ERROR') {
            console.log('Bundling finished with error: ', error);
        }
    });

    process.on('exit', function () {
        // watcher.stopWatchingFiles();
        rollupUmdApi.shutdown();
    });


    const port: number = 7373;
    const socketPort: number = 7474;

    const app = express();

    const httpServer = http.createServer(app);
    const io = new socketIO.Server(httpServer, {
        cors: {
            origin: '*'
        }
    });

    io.on("connection", (socket) => {
        console.log("Connected to the client");
        clientSockets[socket.id] = socket;

        socket.conn.on("close", (reason) => {
            // called when the underlying connection is closed
            console.log("Client is disconnected: ", reason);
            delete clientSockets[socket.id];
        });

        socket.on('upload_skin', (message) => {
            console.log('Building theme library...', message);
            uploadSkin(message, libDirPath, distDirPath, dataDirPath)
                .then(() => {
                    socket.emit('skin_uploading_success', 'OK');
                })
                .catch(error => {
                    if (isString(error)) {
                        socket.emit('skin_uploading_error', error);
                        console.error(`ERROR: ${error}`);
                    } else if (error.message) {
                        socket.emit('skin_uploading_error', error.message);
                        console.error(`ERROR: ${error.message}`);
                    } else {
                        socket.emit('skin_uploading_error', JSON.stringify(error));
                        console.error(`ERROR: ${JSON.stringify(error)}`);
                    }
                });
        });
        const documentClassIndex: DocumentClass_Index = readDocumentClassIndex(dataDirPath);
        socket.emit("hello", {documentClassIndex});
    });

    io.on('disconnect', (socket) => {

    });

    io.engine.on("connection_error", (err: any) => {
        console.log(err.req);      // the request object
        console.log(err.code);     // the error code, for example 1
        console.log(err.message);  // the error message, for example "Session ID unknown"
        console.log(err.context);  // some additional error context
    });

    app.set('etag', false);
    app.use((req, res, next) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        next();
    });
    app.use(cors({
        origin: '*'
    }));
    app.use('/dist', express.static(distDirPath));

    httpServer.listen(socketPort);

    app.listen(port, () => {
        console.info('Pancodex theme SDK server started on port: ' + port);
        console.info('Socket port: ' + socketPort);
    });
}
