"use client";

import React, { useRef, useEffect } from 'react';
import App from './app';

const ThreeScene = () =>
{
    const containerRef = useRef(null);

    useEffect(() =>
    {
        if (typeof window !== 'undefined')
        {
            const app = new App();

            containerRef.current?.appendChild(app.renderer.domElement);

            const handleMouseDown = (e) =>
            {
                e.preventDefault();
                app.HandleMouseClick();
            }

            const handleMouseMove = (e) =>
            {
                app.HandleMouseMove(e);
            }

            const handleResize = () =>
            {
                app.HandleResize();
            };

            const renderScene = () =>
            {
                app.Render();
                requestAnimationFrame(renderScene);
            };

            renderScene();

            window.addEventListener('mousedown', handleMouseDown);
            window.addEventListener('pointermove', handleMouseMove);
            window.addEventListener('resize', handleResize);

            return () =>
            {
                window.removeEventListener('mousedown', handleMouseDown);
                window.removeEventListener('pointermove', handleMouseMove);
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);

    return <div ref={containerRef} />;
};

export default ThreeScene;
