import React, { useState, useRef, useEffect } from 'react';
export const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};

// Hook más específico para cards que maneja IDs
export const useClickOutsideCards = (ref, callback, isOpen, cardId) => {
  useEffect(() => {
    if (!isOpen) return; // Solo escuchar cuando esté abierto

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback(cardId);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback, isOpen, cardId]);
};