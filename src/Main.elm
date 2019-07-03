port module Main exposing (main)

import Browser
import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)


port changed : Int -> Cmd msg


port decrement : (Int -> msg) -> Sub msg


port increment : (Int -> msg) -> Sub msg


type Msg
    = Decrement Int
    | Increment Int


main : Program () { count : Int } Msg
main =
    Browser.element
        { init = \_ -> ( { count = 0 }, changed 0 )
        , subscriptions =
            \_ ->
                Sub.batch
                    [ decrement Decrement
                    , increment Increment
                    ]
        , update =
            \msg model ->
                case msg of
                    Decrement amount ->
                        let
                            newCount =
                                model.count - amount
                        in
                        ( { model | count = newCount }, changed newCount )

                    Increment amount ->
                        let
                            newCount =
                                model.count + amount
                        in
                        ( { model | count = newCount }, changed newCount )
        , view =
            \{ count } ->
                div []
                    [ button [ onClick (Decrement 2) ] [ text "-" ]
                    , text (String.fromInt count)
                    , button [ onClick (Increment 3) ] [ text "+" ]
                    ]
        }
