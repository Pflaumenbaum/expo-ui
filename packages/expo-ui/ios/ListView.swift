// Copyright 2025-present 650 Industries. All rights reserved.

import SwiftUI
import ExpoModulesCore

class ListProps: ExpoSwiftUI.ViewProps {
    @Field var listStyle: String?
}

struct ListView: ExpoSwiftUI.View {
@EnvironmentObject var props: ListProps
    var body: some View {
      List(self.props.children ?? []) { $0 }
          .modifier(ListStyleModifer(style: props.listStyle ?? "automatic"))
  }
}


struct ListStyleModifer: ViewModifier {
    var style: String
    @ViewBuilder func body(content: Content) -> some View {
        switch style {
        case "grouped": content.listStyle(.grouped)
        case "insetGrouped": content.listStyle(.insetGrouped)
        case "inset": content.listStyle(.inset)
        case "plain": content.listStyle(.plain)
        case "sidebar": content.listStyle(.sidebar)
        case "automatic": content.listStyle(.automatic)
        default: content
        }
    }
}
