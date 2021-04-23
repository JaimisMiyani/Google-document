import React from 'react';
import { useEffect, useCallback, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';

const SET_TIMER = 2000;
const TOOLBAR = [
    [{header: [1, 2, 3, 4, 5, 6, false]}],
    [{font : []}],
    [{list : 'ordered'}, {list : 'bullet'}],
    ['bold', 'italic', 'underline'],
    [{color : []}, {backgrounf : []}],
    [{script : 'sub'}, {script : 'super'}],
    [{align : []}],
    ['image', 'blockquote', 'code-block'],
    ['clean'],
]

const TextEditer = () => {
    const{id : documentId} = useParams(); // id as documentId
    const [socket, setSocket] = useState();
    const [quill, setQuill] = useState();

    const wrapperRef = useCallback(wrapper => {
        if(wrapper == null) return;
        console.log('craete new div')
        wrapper.innerHTML = '';
        const editor = document.createElement('div');
        wrapper.append(editor);
        const q = new Quill(editor, { theme : 'snow', modules : {toolbar : TOOLBAR}});
        q.disable();
        q.setText('Document id loading...');
        setQuill(q);
    },[])

    useEffect(() => {
        const s = io('http://localhost:9001');
        setSocket(s);

        return () => {
            s.disconnect();
        }
    }, []);
    
    useEffect(() => {
        if(socket == null || quill == null) return;
        
        socket.once('load-document', document => {
            quill.setContents(document);
            quill.enable();
        });

        socket.emit('get-document', documentId);
    }, [socket, quill, documentId])

    useEffect(() => {
        if(socket == null || quill == null) return;
        
        const interval = setInterval(() => {
            socket.emit('save-document', quill.getContents());
        }, SET_TIMER);

        return () => {
            clearInterval(interval);
        }
    }, [socket, quill])

    useEffect(() => {
        if(socket == null || quill == null) return;
        const handle = (delta) => {
            quill.updateContents(delta);
        }

        socket.on('receive-changes', handle);

        return () => {            
            socket.off('receive-changes', handle);
        }
    }, [socket, quill])

    useEffect(() => {
        console.log('in use effect')
        if(socket == null || quill == null) return;
        const handle = (delta, oldDelta, source) => {
            if(source !== 'user') return;
            socket.emit('send-changes', delta);
        }

        quill.on('text-change', handle);

        return () => {            
            quill.off('text-change', handle);
        }
    }, [socket, quill])

    return (
      <div className="containor" ref = {wrapperRef} >
      </div>
    );
}

export default TextEditer;
