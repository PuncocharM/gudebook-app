export interface PurchasedGuideAPI {
    title: string;
    subtitle: string;
    year: number;
    cover_image: string;
}

export interface HistogramBarAPI {
    label: string;
    count: number;
}

export interface GuideAPI {
    title: string;
    year: string;
    cover_image: string;
}

export interface RootCragAPI {
    name: string
    url: string
    bought: boolean
    latitude: number
    longitude: number
    histogram: HistogramBarAPI[]
    characteristics: string[]
    exposition: string
    expositions: string[]
    altitude: number
    approach_time: number
    family_friendly: boolean
    comfortable_base: boolean
    easy_parking: boolean
    gorgeous: boolean
    good_bolting: boolean
    peaceful: boolean
    for_beginners: boolean
    rain: boolean
    guide: GuideAPI
    [key: string]: any,
}

export interface CragAPI {
    name: string;
    cover_image: string | null;
    images: ImageAPI[] | null;
    description: string;
    guide: GuideAPI;
}

export interface ApproachAPI {
    description: string;
    image: string | null;
    time: number;
}

export interface SectorAPI {
    name: string;
    url: string;
}

export interface PitchAPI {
    name: string;
    length: number;
    comment: string;
    difficulty_grade: string;
}

export interface RouteAPI {
    number: number;
    name: string;
    beautiful: boolean;
    pitches: PitchAPI[];
}

export interface ImageAPI {
    thumbnail_url: string;
    url: string;
}

export interface SectorInstance {
    name: string;
    histogram: any[];
    images: ImageAPI[];
    routes: RouteAPI[];
}