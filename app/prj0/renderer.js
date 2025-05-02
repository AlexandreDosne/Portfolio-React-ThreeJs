"use client";

import React, { useRef, useEffect } from 'react';
import App0 from './app';

export default function ThreeScene()
{
    const containerRef = useRef(null);

    useEffect(() =>
    {
        if (typeof window !== 'undefined')
        {
            const app = new App0();
            const container = containerRef.current;

            container?.appendChild(app.renderer.domElement);

            const handleMouseDown = (e) =>
            {
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
                app.renderer.dispose();
                container?.removeChild(app.renderer.domElement);

                window.removeEventListener('mousedown', handleMouseDown);
                window.removeEventListener('pointermove', handleMouseMove);
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);

    return <div ref={containerRef} />;
};
