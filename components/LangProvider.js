'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const dict = {
  en: {
    appName: 'PawBD',
    map: 'Map',
    board: 'Adoption board',
    post: 'Post',
    login: 'Log in',
    logout: 'Log out',
    all: 'All',
    cat: 'Cat',
    dog: 'Dog',
    give_away: 'For adoption',
    adopt_request: 'Wants to adopt',
    rescue_alert: 'Needs rescue',
    division: 'Division',
    district: 'District / area',
    title: 'Title',
    description: 'Description',
    age: 'Age (e.g. 3 months)',
    contact: 'Contact (phone / WhatsApp)',
    photo: 'Photo',
    species: 'Animal',
    kind: 'I want to…',
    pickLocation: 'Tap the map to set the location',
    useMyLocation: 'Use my current location',
    submit: 'Publish',
    noPosts: 'Nothing here yet.',
    loginToSee: 'Log in to see contact details',
    open: 'Open',
    someone_helping: 'Someone is helping',
    closed: 'Closed',
    imHelping: "I'm helping",
    markClosed: 'Mark as done',
    delete: 'Delete',
    report: 'Report this post',
    reported: 'Thanks, we received your report.',
    email: 'Email',
    password: 'Password',
    fullName: 'Full name',
    signIn: 'Sign in',
    signUp: 'Create account',
    google: 'Continue with Google',
    needLogin: 'Please log in to post.',
    rescueNeedsLocation: 'Rescue alerts need a location on the map.',
  },
  bn: {
    appName: 'PawBD',
    map: 'মানচিত্র',
    board: 'দত্তক বোর্ড',
    post: 'পোস্ট করুন',
    login: 'লগ ইন',
    logout: 'লগ আউট',
    all: 'সব',
    cat: 'বিড়াল',
    dog: 'কুকুর',
    give_away: 'দত্তক দেওয়া হবে',
    adopt_request: 'দত্তক নিতে চান',
    rescue_alert: 'উদ্ধার প্রয়োজন',
    division: 'বিভাগ',
    district: 'জেলা / এলাকা',
    title: 'শিরোনাম',
    description: 'বিবরণ',
    age: 'বয়স (যেমন ৩ মাস)',
    contact: 'যোগাযোগ (ফোন / হোয়াটসঅ্যাপ)',
    photo: 'ছবি',
    species: 'প্রাণী',
    kind: 'আমি চাই…',
    pickLocation: 'অবস্থান ঠিক করতে মানচিত্রে ট্যাপ করুন',
    useMyLocation: 'আমার বর্তমান অবস্থান ব্যবহার করুন',
    submit: 'প্রকাশ করুন',
    noPosts: 'এখনও কিছু নেই।',
    loginToSee: 'যোগাযোগের তথ্য দেখতে লগ ইন করুন',
    open: 'খোলা',
    someone_helping: 'কেউ সাহায্য করছেন',
    closed: 'বন্ধ',
    imHelping: 'আমি সাহায্য করছি',
    markClosed: 'সম্পন্ন হিসেবে চিহ্নিত করুন',
    delete: 'মুছুন',
    report: 'এই পোস্ট রিপোর্ট করুন',
    reported: 'ধন্যবাদ, আপনার রিপোর্ট পেয়েছি।',
    email: 'ইমেইল',
    password: 'পাসওয়ার্ড',
    fullName: 'পূর্ণ নাম',
    signIn: 'সাইন ইন',
    signUp: 'অ্যাকাউন্ট তৈরি করুন',
    google: 'গুগল দিয়ে চালিয়ে যান',
    needLogin: 'পোস্ট করতে লগ ইন করুন।',
    rescueNeedsLocation: 'উদ্ধারের জন্য মানচিত্রে অবস্থান দিতে হবে।',
  },
};

const Ctx = createContext({ lang: 'en', setLang: () => {}, t: (k) => k });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lang');
      if (saved === 'bn' || saved === 'en') setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l) => {
    setLangState(l);
    try {
      localStorage.setItem('lang', l);
    } catch {}
  };

  const t = (k) => dict[lang][k] ?? dict.en[k] ?? k;

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
