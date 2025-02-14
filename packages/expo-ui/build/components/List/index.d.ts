import { StyleProp, ViewStyle } from 'react-native';
export type ListProps = {
    listStyle?: ListStyle;
    data: Array<any>;
    style?: StyleProp<ViewStyle>;
    renderItem: ({ item }: {
        item: any;
        index: number;
    }) => React.ReactNode;
};
export type NativeListProps = {
    listStyle?: ListStyle;
    style?: StyleProp<ViewStyle>;
    children: React.ReactNode;
};
type ListStyle = "automatic" | "inset" | "insetGrouped" | "grouped" | "sidebar" | "palin";
export declare function List(props: ListProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=index.d.ts.map